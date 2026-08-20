from pydantic import BaseModel
from datetime import datetime


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    due_date: datetime | None = None            # ← new


class Task(BaseModel):
    id: int
    title: str
    description: str | None = None
    completed: bool = False
    due_date: datetime | None = None            # ← new

    class Config:
        from_attributes = True