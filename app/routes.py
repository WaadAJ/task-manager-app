from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Task, TaskCreate
from app.task_model import TaskDB
from app.user_model import UserDB
from app.auth_routes import get_current_user


router = APIRouter()


@router.get("/tasks", response_model=list[Task])
def get_tasks(
    completed: bool | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    query = db.query(TaskDB).filter(TaskDB.user_id == current_user.id)

    if completed is not None:
        query = query.filter(TaskDB.completed == completed)
    if search:
        query = query.filter(TaskDB.title.contains(search))

    return query.offset(skip).limit(limit).all()


@router.post("/tasks", response_model=Task)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    new_task = TaskDB(
        title=task.title,
        description=task.description,
        completed=False,
        user_id=current_user.id,                                       # ← new
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


@router.put("/tasks/{task_id}", response_model=Task)
def update_task(
    task_id: int,
    updated_task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    task = db.query(TaskDB).filter(TaskDB.id == task_id, TaskDB.user_id == current_user.id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    task.title = updated_task.title
    task.description = updated_task.description
    db.commit()
    db.refresh(task)
    return task


@router.patch("/tasks/{task_id}/complete", response_model=Task)
def toggle_task_completion(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    task = db.query(TaskDB).filter(TaskDB.id == task_id, TaskDB.user_id == current_user.id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    task.completed = not task.completed
    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    task = db.query(TaskDB).filter(TaskDB.id == task_id, TaskDB.user_id == current_user.id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}


@router.post("/tasks/bulk", response_model=list[Task])
def create_tasks_bulk(
    tasks: list[TaskCreate],
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user),
):
    new_tasks = []
    for task in tasks:
        db_task = TaskDB(
            title=task.title,
            description=task.description,
            completed=False,
            user_id=current_user.id,                                   # ← new
        )
        db.add(db_task)
        new_tasks.append(db_task)

    db.commit()
    for task in new_tasks:
        db.refresh(task)
    return new_tasks