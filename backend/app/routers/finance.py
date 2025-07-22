# app/routers/finance.py
from fastapi import APIRouter, Depends, HTTPException, Request, Query, UploadFile, File
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta
from decimal import Decimal
import logging
import json

from app.models.finance import *
from app.services.finance_auth import (
    get_current_finance_user,
    get_admin_user,
    get_manager_user,
    check_permission,
    get_accessible_clinics,
    FinancePermissions,
    log_audit_action,
    security_check_middleware,
    can_edit_transaction,
)
from app.db.context import get_db_cursor

logger = logging.getLogger(__name__)
router = APIRouter()


# Dashboard & Stats Endpoints
@router.get("/dashboard/stats", response_model=FinanceStatsResponse)
async def get_finance_dashboard_stats(
    request: Request, current_user: Dict[str, Any] = Depends(get_current_finance_user)
):
    """Get finance dashboard statistics"""
    await security_check_middleware(request, current_user)

    accessible_clinics = get_accessible_clinics(current_user)

    try:
        with get_db_cursor() as cur:
            # Build clinic filter
            clinic_filter = ""
            params = []
            if accessible_clinics is not None:
                if accessible_clinics:
                    clinic_filter = "WHERE clinic_id = ANY(%s)"
                    params.append(accessible_clinics)
                else:
                    # No accessible clinics
                    return FinanceStatsResponse(
                        total_revenue=Decimal("0"),
                        total_expenses=Decimal("0"),
                        monthly_revenue=Decimal("0"),
                        monthly_expenses=Decimal("0"),
                        pending_approvals=0,
                        active_clinics=0,
                        recent_transactions=0,
                    )

            # Total revenue
            cur.execute(
                f"""
                SELECT COALESCE(SUM(amount), 0) FROM transactions 
                {clinic_filter} AND transaction_type = 'revenue'
            """,
                params,
            )
            total_revenue = cur.fetchone()[0]

            # Total expenses
            cur.execute(
                f"""
                SELECT COALESCE(SUM(amount), 0) FROM transactions 
                {clinic_filter} AND transaction_type = 'expense'
            """,
                params,
            )
            total_expenses = cur.fetchone()[0]

            # Monthly revenue (current month)
            monthly_params = params + [datetime.now().replace(day=1).date()]
            cur.execute(
                f"""
                SELECT COALESCE(SUM(amount), 0) FROM transactions 
                {clinic_filter} AND transaction_type = 'revenue' 
                AND transaction_date >= %s
            """,
                monthly_params,
            )
            monthly_revenue = cur.fetchone()[0]

            # Monthly expenses (current month)
            cur.execute(
                f"""
                SELECT COALESCE(SUM(amount), 0) FROM transactions 
                {clinic_filter} AND transaction_type = 'expense' 
                AND transaction_date >= %s
            """,
                monthly_params,
            )
            monthly_expenses = cur.fetchone()[0]

            # Pending approvals
            cur.execute(
                f"""
                SELECT COUNT(*) FROM transactions 
                {clinic_filter} AND is_approved = false
            """,
                params,
            )
            pending_approvals = cur.fetchone()[0]

            # Active clinics
            if accessible_clinics is None:
                cur.execute("SELECT COUNT(*) FROM clinics WHERE is_active = true")
                active_clinics = cur.fetchone()[0]
            else:
                active_clinics = len(accessible_clinics) if accessible_clinics else 0

            # Recent transactions (last 7 days)
            recent_params = params + [(datetime.now() - timedelta(days=7)).date()]
            cur.execute(
                f"""
                SELECT COUNT(*) FROM transactions 
                {clinic_filter} AND transaction_date >= %s
            """,
                recent_params,
            )
            recent_transactions = cur.fetchone()[0]

            return FinanceStatsResponse(
                total_revenue=total_revenue,
                total_expenses=total_expenses,
                monthly_revenue=monthly_revenue,
                monthly_expenses=monthly_expenses,
                pending_approvals=pending_approvals,
                active_clinics=active_clinics,
                recent_transactions=recent_transactions,
            )

    except Exception as e:
        logger.error(f"Error fetching finance stats: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to fetch finance statistics"
        )


@router.get("/dashboard/clinic-stats", response_model=List[ClinicFinanceStatsResponse])
async def get_clinic_finance_stats(
    request: Request, current_user: Dict[str, Any] = Depends(get_current_finance_user)
):
    """Get finance statistics by clinic"""
    await security_check_middleware(request, current_user)

    accessible_clinics = get_accessible_clinics(current_user)

    try:
        with get_db_cursor() as cur:
            # Build clinic filter
            clinic_filter = ""
            params = []
            if accessible_clinics is not None:
                if accessible_clinics:
                    clinic_filter = "WHERE c.id = ANY(%s)"
                    params.append(accessible_clinics)
                else:
                    return []

            cur.execute(
                f"""
                SELECT 
                    c.id,
                    c.clinic_name,
                    COALESCE(daily_rev.amount, 0) as daily_revenue,
                    COALESCE(monthly_rev.amount, 0) as monthly_revenue,
                    COALESCE(monthly_exp.amount, 0) as monthly_expenses,
                    COALESCE(pc.current_balance, 0) as petty_cash_balance,
                    COALESCE(pending.count, 0) as pending_transactions
                FROM clinics c
                LEFT JOIN (
                    SELECT clinic_id, SUM(amount) as amount 
                    FROM transactions 
                    WHERE transaction_type = 'revenue' 
                    AND transaction_date = CURRENT_DATE
                    GROUP BY clinic_id
                ) daily_rev ON c.id = daily_rev.clinic_id
                LEFT JOIN (
                    SELECT clinic_id, SUM(amount) as amount 
                    FROM transactions 
                    WHERE transaction_type = 'revenue' 
                    AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
                    GROUP BY clinic_id
                ) monthly_rev ON c.id = monthly_rev.clinic_id
                LEFT JOIN (
                    SELECT clinic_id, SUM(amount) as amount 
                    FROM transactions 
                    WHERE transaction_type = 'expense' 
                    AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
                    GROUP BY clinic_id
                ) monthly_exp ON c.id = monthly_exp.clinic_id
                LEFT JOIN petty_cash_balances pc ON c.id = pc.clinic_id
                LEFT JOIN (
                    SELECT clinic_id, COUNT(*) as count 
                    FROM transactions 
                    WHERE is_approved = false
                    GROUP BY clinic_id
                ) pending ON c.id = pending.clinic_id
                {clinic_filter}
                ORDER BY c.clinic_name
            """,
                params,
            )

            results = []
            for row in cur.fetchall():
                results.append(
                    ClinicFinanceStatsResponse(
                        clinic_id=row[0],
                        clinic_name=row[1],
                        daily_revenue=row[2],
                        monthly_revenue=row[3],
                        monthly_expenses=row[4],
                        petty_cash_balance=row[5],
                        pending_transactions=row[6],
                    )
                )

            return results

    except Exception as e:
        logger.error(f"Error fetching clinic stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch clinic statistics")


# Transaction Endpoints
@router.get("/transactions", response_model=List[Transaction])
async def get_transactions(
    request: Request,
    clinic_id: Optional[int] = Query(None),
    transaction_type: Optional[TransactionType] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    is_approved: Optional[bool] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    current_user: Dict[str, Any] = Depends(get_current_finance_user),
):
    """Get transactions with filtering"""
    await security_check_middleware(request, current_user)

    accessible_clinics = get_accessible_clinics(current_user)

    try:
        with get_db_cursor() as cur:
            # Build WHERE clause
            where_conditions = []
            params = []

            # Clinic access control
            if accessible_clinics is not None:
                if accessible_clinics:
                    where_conditions.append("t.clinic_id = ANY(%s)")
                    params.append(accessible_clinics)
                else:
                    return []

            # Apply filters
            if clinic_id:
                if accessible_clinics is None or clinic_id in accessible_clinics:
                    where_conditions.append("t.clinic_id = %s")
                    params.append(clinic_id)
                else:
                    raise HTTPException(
                        status_code=403, detail="Access denied to this clinic"
                    )

            if transaction_type:
                where_conditions.append("t.transaction_type = %s")
                params.append(transaction_type.value)

            if start_date:
                where_conditions.append("t.transaction_date >= %s")
                params.append(start_date)

            if end_date:
                where_conditions.append("t.transaction_date <= %s")
                params.append(end_date)

            if is_approved is not None:
                where_conditions.append("t.is_approved = %s")
                params.append(is_approved)

            where_clause = (
                "WHERE " + " AND ".join(where_conditions) if where_conditions else ""
            )

            # Add pagination params
            params.extend([limit, offset])

            cur.execute(
                f"""
                SELECT 
                    t.id, t.clinic_id, t.transaction_type, t.category_id, t.subcategory,
                    t.amount, t.description, t.transaction_date, t.bank_id, t.account_type_id,
                    t.reference_number, t.is_petty_cash, t.created_by, t.modified_by,
                    t.created_at, t.modified_at, t.is_approved, t.approved_by, t.approved_at,
                    c.clinic_name, 
                    CASE 
                        WHEN t.transaction_type = 'revenue' THEN rc.category_name
                        WHEN t.transaction_type = 'expense' THEN ec.category_name
                        ELSE 'Transfer'
                    END as category_name,
                    b.bank_name, at.type_name as account_type_name,
                    u.username as created_by_username
                FROM transactions t
                LEFT JOIN clinics c ON t.clinic_id = c.id
                LEFT JOIN revenue_categories rc ON t.category_id = rc.id AND t.transaction_type = 'revenue'
                LEFT JOIN expense_categories ec ON t.category_id = ec.id AND t.transaction_type = 'expense'
                LEFT JOIN banks b ON t.bank_id = b.id
                LEFT JOIN account_types at ON t.account_type_id = at.id
                LEFT JOIN users u ON t.created_by = u.id
                {where_clause}
                ORDER BY t.created_at DESC
                LIMIT %s OFFSET %s
            """,
                params,
            )

            transactions = []
            for row in cur.fetchall():
                transactions.append(
                    Transaction(
                        id=row[0],
                        clinic_id=row[1],
                        transaction_type=row[2],
                        category_id=row[3],
                        subcategory=row[4],
                        amount=row[5],
                        description=row[6],
                        transaction_date=row[7],
                        bank_id=row[8],
                        account_type_id=row[9],
                        reference_number=row[10],
                        is_petty_cash=row[11],
                        created_by=row[12],
                        modified_by=row[13],
                        created_at=row[14],
                        modified_at=row[15],
                        is_approved=row[16],
                        approved_by=row[17],
                        approved_at=row[18],
                        clinic_name=row[19],
                        category_name=row[20],
                        bank_name=row[21],
                        account_type_name=row[22],
                        created_by_username=row[23],
                    )
                )

            return transactions

    except Exception as e:
        logger.error(f"Error fetching transactions: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch transactions")


@router.post("/transactions", response_model=Transaction)
async def create_transaction(
    request: Request,
    transaction: TransactionCreate,
    current_user: Dict[str, Any] = Depends(get_manager_user),
):
    """Create new transaction"""
    await security_check_middleware(request, current_user)

    # Check clinic access
    if not check_permission(
        current_user, FinancePermissions.CREATE_TRANSACTIONS, transaction.clinic_id
    ):
        raise HTTPException(status_code=403, detail="Access denied to this clinic")

    try:
        with get_db_cursor() as cur:
            # Insert transaction
            cur.execute(
                """
                INSERT INTO transactions (
                    clinic_id, transaction_type, category_id, subcategory, amount,
                    description, transaction_date, bank_id, account_type_id,
                    reference_number, is_petty_cash, created_by, modified_by
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, created_at, modified_at
            """,
                (
                    transaction.clinic_id,
                    transaction.transaction_type.value,
                    transaction.category_id,
                    transaction.subcategory,
                    transaction.amount,
                    transaction.description,
                    transaction.transaction_date,
                    transaction.bank_id,
                    transaction.account_type_id,
                    transaction.reference_number,
                    transaction.is_petty_cash,
                    current_user["id"],
                    current_user["id"],
                ),
            )

            result = cur.fetchone()
            transaction_id = result[0]

            # Log audit action
            log_audit_action(
                user_id=current_user["id"],
                table_name="transactions",
                record_id=transaction_id,
                action="INSERT",
                new_values=transaction.dict(),
                ip_address=request.client.host,
                user_agent=request.headers.get("user-agent"),
            )

            # Fetch complete transaction data
            cur.execute(
                """
                SELECT 
                    t.id, t.clinic_id, t.transaction_type, t.category_id, t.subcategory,
                    t.amount, t.description, t.transaction_date, t.bank_id, t.account_type_id,
                    t.reference_number, t.is_petty_cash, t.created_by, t.modified_by,
                    t.created_at, t.modified_at, t.is_approved, t.approved_by, t.approved_at,
                    c.clinic_name
                FROM transactions t
                LEFT JOIN clinics c ON t.clinic_id = c.id
                WHERE t.id = %s
            """,
                (transaction_id,),
            )

            row = cur.fetchone()
            return Transaction(
                id=row[0],
                clinic_id=row[1],
                transaction_type=row[2],
                category_id=row[3],
                subcategory=row[4],
                amount=row[5],
                description=row[6],
                transaction_date=row[7],
                bank_id=row[8],
                account_type_id=row[9],
                reference_number=row[10],
                is_petty_cash=row[11],
                created_by=row[12],
                modified_by=row[13],
                created_at=row[14],
                modified_at=row[15],
                is_approved=row[16],
                approved_by=row[17],
                approved_at=row[18],
                clinic_name=row[19],
            )

    except Exception as e:
        logger.error(f"Error creating transaction: {e}")
        raise HTTPException(status_code=500, detail="Failed to create transaction")


# Add more endpoints...
# (Revenue summaries, clinics, categories, etc.)
# This is a partial implementation - would continue with all CRUD operations


# Revenue Summary Endpoints
@router.get("/revenue-summaries", response_model=List[DailyRevenueSummary])
async def get_revenue_summaries(
    request: Request,
    clinic_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: Dict[str, Any] = Depends(get_current_finance_user),
):
    """Get daily revenue summaries"""
    await security_check_middleware(request, current_user)

    accessible_clinics = get_accessible_clinics(current_user)

    try:
        with get_db_cursor() as cur:
            where_conditions = []
            params = []

            # Clinic access control
            if accessible_clinics is not None:
                if accessible_clinics:
                    where_conditions.append("drs.clinic_id = ANY(%s)")
                    params.append(accessible_clinics)
                else:
                    return []

            if clinic_id:
                if accessible_clinics is None or clinic_id in accessible_clinics:
                    where_conditions.append("drs.clinic_id = %s")
                    params.append(clinic_id)
                else:
                    raise HTTPException(
                        status_code=403, detail="Access denied to this clinic"
                    )

            if start_date:
                where_conditions.append("drs.summary_date >= %s")
                params.append(start_date)

            if end_date:
                where_conditions.append("drs.summary_date <= %s")
                params.append(end_date)

            where_clause = (
                "WHERE " + " AND ".join(where_conditions) if where_conditions else ""
            )

            cur.execute(
                f"""
                SELECT 
                    drs.id, drs.clinic_id, drs.summary_date, drs.program_income,
                    drs.rdf_income, drs.bank_interest, drs.other_income, drs.total_revenue,
                    drs.submitted_by, drs.submitted_at, drs.is_verified, drs.verified_by,
                    drs.verified_at, c.clinic_name, u.username as submitted_by_username
                FROM daily_revenue_summaries drs
                LEFT JOIN clinics c ON drs.clinic_id = c.id
                LEFT JOIN users u ON drs.submitted_by = u.id
                {where_clause}
                ORDER BY drs.summary_date DESC, c.clinic_name
            """,
                params,
            )

            summaries = []
            for row in cur.fetchall():
                summaries.append(
                    DailyRevenueSummary(
                        id=row[0],
                        clinic_id=row[1],
                        summary_date=row[2],
                        program_income=row[3],
                        rdf_income=row[4],
                        bank_interest=row[5],
                        other_income=row[6],
                        total_revenue=row[7],
                        submitted_by=row[8],
                        submitted_at=row[9],
                        is_verified=row[10],
                        verified_by=row[11],
                        verified_at=row[12],
                        clinic_name=row[13],
                        submitted_by_username=row[14],
                    )
                )

            return summaries

    except Exception as e:
        logger.error(f"Error fetching revenue summaries: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch revenue summaries")


# Clinic Management (Admin only)
@router.get("/clinics", response_model=List[Clinic])
async def get_clinics(
    request: Request, current_user: Dict[str, Any] = Depends(get_current_finance_user)
):
    """Get all clinics (filtered by access)"""
    await security_check_middleware(request, current_user)

    accessible_clinics = get_accessible_clinics(current_user)

    try:
        with get_db_cursor() as cur:
            if accessible_clinics is None:
                # Admin can see all clinics
                cur.execute(
                    """
                    SELECT id, clinic_name, location, address, phone, email, is_active, created_at
                    FROM clinics ORDER BY clinic_name
                """
                )
            elif accessible_clinics:
                # User can see specific clinics
                cur.execute(
                    """
                    SELECT id, clinic_name, location, address, phone, email, is_active, created_at
                    FROM clinics WHERE id = ANY(%s) ORDER BY clinic_name
                """,
                    (accessible_clinics,),
                )
            else:
                return []

            clinics = []
            for row in cur.fetchall():
                clinics.append(
                    Clinic(
                        id=row[0],
                        clinic_name=row[1],
                        location=row[2],
                        address=row[3],
                        phone=row[4],
                        email=row[5],
                        is_active=row[6],
                        created_at=row[7],
                    )
                )

            return clinics

    except Exception as e:
        logger.error(f"Error fetching clinics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch clinics")
