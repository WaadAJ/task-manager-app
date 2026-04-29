from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str
    description: str | None = None


class Task(BaseModel):
    id: int
    title: str
    description: str | None = None
    completed: bool = False