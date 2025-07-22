
# app/models/finance.py
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from decimal import Decimal
from enum import Enum

class TransactionType(str, Enum):
    REVENUE = "revenue"
    EXPENSE = "expense"
    TRANSFER = "transfer"

class UserRole(str, Enum):
    ADMINISTRATOR = "administrator"
    MANAGER = "manager"
    MANAGEMENT_STAFF = "management_staff"
    STAFF = "staff"

# Base Models
class FinanceBaseModel(BaseModel):
    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v),
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }

# User Models (extending existing)
class UserFinanceUpdate(BaseModel):
    role: Optional[UserRole] = None
    clinic_id: Optional[int] = None
    finance_permissions: Optional[Dict[str, Any]] = None

class UserWithFinance(FinanceBaseModel):
    id: int
    username: str
    email: Optional[str] = None
    role: str
    clinic_id: Optional[int] = None
    finance_permissions: Optional[Dict[str, Any]] = None
    is_active: bool = True
    created_at: datetime

# Clinic Models
class ClinicBase(BaseModel):
    clinic_name: str = Field(..., min_length=1, max_length=100)
    location: Optional[str] = Field(None, max_length=200)
    address: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=100)

class ClinicCreate(ClinicBase):
    pass

class ClinicUpdate(BaseModel):
    clinic_name: Optional[str] = Field(None, min_length=1, max_length=100)
    location: Optional[str] = Field(None, max_length=200)
    address: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None

class Clinic(ClinicBase, FinanceBaseModel):
    id: int
    is_active: bool = True
    created_at: datetime

# Bank Models
class BankBase(BaseModel):
    bank_name: str = Field(..., min_length=1, max_length=100)
    bank_code: Optional[str] = Field(None, max_length=20)

class BankCreate(BankBase):
    pass

class Bank(BankBase, FinanceBaseModel):
    id: int
    created_at: datetime

# Account Type Models
class AccountTypeBase(BaseModel):
    type_name: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None

class AccountTypeCreate(AccountTypeBase):
    pass

class AccountType(AccountTypeBase, FinanceBaseModel):
    id: int
    created_at: datetime

# Revenue Category Models
class RevenueCategoryBase(BaseModel):
    category_name: str = Field(..., min_length=1, max_length=100)
    subcategories: Optional[List[str]] = None

class RevenueCategoryCreate(RevenueCategoryBase):
    pass

class RevenueCategory(RevenueCategoryBase, FinanceBaseModel):
    id: int
    is_active: bool = True
    created_at: datetime

# Expense Category Models
class ExpenseCategoryBase(BaseModel):
    category_name: str = Field(..., min_length=1, max_length=100)
    budget_code: Optional[str] = Field(None, max_length=20)

class ExpenseCategoryCreate(ExpenseCategoryBase):
    pass

class ExpenseCategory(ExpenseCategoryBase, FinanceBaseModel):
    id: int
    is_active: bool = True
    created_at: datetime

# Transaction Models
class TransactionBase(BaseModel):
    clinic_id: int
    transaction_type: TransactionType
    category_id: int
    subcategory: Optional[str] = Field(None, max_length=100)
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    description: Optional[str] = None
    transaction_date: date
    bank_id: Optional[int] = None
    account_type_id: Optional[int] = None
    reference_number: Optional[str] = Field(None, max_length=100)
    is_petty_cash: bool = False

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    category_id: Optional[int] = None
    subcategory: Optional[str] = Field(None, max_length=100)
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    description: Optional[str] = None
    transaction_date: Optional[date] = None
    bank_id: Optional[int] = None
    account_type_id: Optional[int] = None
    reference_number: Optional[str] = Field(None, max_length=100)
    is_petty_cash: Optional[bool] = None

class Transaction(TransactionBase, FinanceBaseModel):
    id: int
    created_by: int
    modified_by: Optional[int] = None
    created_at: datetime
    modified_at: datetime
    is_approved: bool = False
    approved_by: Optional[int] = None
    approved_at: Optional[datetime] = None

    # Related data (populated by joins)
    clinic_name: Optional[str] = None
    category_name: Optional[str] = None
    bank_name: Optional[str] = None
    account_type_name: Optional[str] = None
    created_by_username: Optional[str] = None

# Daily Revenue Summary Models
class DailyRevenueSummaryBase(BaseModel):
    clinic_id: int
    summary_date: date
    program_income: Decimal = Field(default=Decimal('0'), ge=0, decimal_places=2)
    rdf_income: Decimal = Field(default=Decimal('0'), ge=0, decimal_places=2)
    bank_interest: Decimal = Field(default=Decimal('0'), ge=0, decimal_places=2)
    other_income: Decimal = Field(default=Decimal('0'), ge=0, decimal_places=2)

class DailyRevenueSummaryCreate(DailyRevenueSummaryBase):
    pass

class DailyRevenueSummaryUpdate(BaseModel):
    program_income: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    rdf_income: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    bank_interest: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    other_income: Optional[Decimal] = Field(None, ge=0, decimal_places=2)

class DailyRevenueSummary(DailyRevenueSummaryBase, FinanceBaseModel):
    id: int
    total_revenue: Decimal
    submitted_by: int
    submitted_at: datetime
    is_verified: bool = False
    verified_by: Optional[int] = None
    verified_at: Optional[datetime] = None

    # Related data
    clinic_name: Optional[str] = None
    submitted_by_username: Optional[str] = None

# Petty Cash Models
class PettyCashBalanceBase(BaseModel):
    clinic_id: int
    current_balance: Decimal = Field(..., decimal_places=2)

class PettyCashBalanceUpdate(BaseModel):
    current_balance: Decimal = Field(..., decimal_places=2)

class PettyCashBalance(PettyCashBalanceBase, FinanceBaseModel):
    id: int
    last_updated: datetime
    updated_by: int
    clinic_name: Optional[str] = None

# Audit Log Models
class AuditLog(FinanceBaseModel):
    id: int
    table_name: str
    record_id: int
    action: str
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    user_id: int
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime
    username: Optional[str] = None

# Response Models
class FinanceStatsResponse(BaseModel):
    total_revenue: Decimal
    total_expenses: Decimal
    monthly_revenue: Decimal
    monthly_expenses: Decimal
    pending_approvals: int
    active_clinics: int
    recent_transactions: int

class ClinicFinanceStatsResponse(BaseModel):
    clinic_id: int
    clinic_name: str
    daily_revenue: Decimal
    monthly_revenue: Decimal
    monthly_expenses: Decimal
    petty_cash_balance: Decimal
    pending_transactions: int

# Filter Models
class TransactionFilter(BaseModel):
    clinic_id: Optional[int] = None
    transaction_type: Optional[TransactionType] = None
    category_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_approved: Optional[bool] = None
    is_petty_cash: Optional[bool] = None
    min_amount: Optional[Decimal] = None
    max_amount: Optional[Decimal] = None

class RevenueReportFilter(BaseModel):
    clinic_id: Optional[int] = None
    start_date: date
    end_date: date
    include_subcategories: bool = True

# Bulk Operations
class BulkTransactionCreate(BaseModel):
    transactions: List[TransactionCreate]

class BulkImportResult(BaseModel):
    success_count: int
    error_count: int
    errors: List[Dict[str, Any]]
    imported_ids: List[int]

# Permission Models
class PermissionCheck(BaseModel):
    user_id: int
    clinic_id: Optional[int] = None
    action: str  # view, edit, delete, approve, etc.
    resource: str  # transaction, revenue, expense, etc.

class PermissionResponse(BaseModel):
    allowed: bool
    reason: Optional[str] = None
