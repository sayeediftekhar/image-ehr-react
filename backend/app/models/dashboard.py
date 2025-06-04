from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class DashboardStats(BaseModel):
    """Dashboard statistics model"""

    total_patients: int = 0
    total_appointments: int = 0
    pending_appointments: int = 0
    total_revenue: float = 0.0
    monthly_revenue: float = 0.0
    active_users: int = 0


class RecentActivity(BaseModel):
    """Recent activity model"""

    id: int
    activity_type: str
    description: str
    user_id: int
    user_name: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None


class DashboardData(BaseModel):
    """Complete dashboard data model"""

    stats: DashboardStats
    recent_activities: List[RecentActivity]
    user_info: Dict[str, Any]


class ChartData(BaseModel):
    """Chart data model"""

    labels: List[str]
    datasets: List[Dict[str, Any]]


class MonthlyStats(BaseModel):
    """Monthly statistics model"""

    month: str
    patients: int
    appointments: int
    revenue: float
