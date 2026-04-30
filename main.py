from fastapi import FastAPI, Depends

from app.database import Base, engine
from app.routes import router
from app.auth_routes import router as auth_router, get_current_user
from app import task_model, user_model


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Manager API")

app.include_router(auth_router)
app.include_router(router, dependencies=[Depends(get_current_user)])


@app.get("/")
def home():
    return {"message": "Task Manager API is running"}