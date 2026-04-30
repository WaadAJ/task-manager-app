from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class TaskDB(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    completed = Column(Boolean, default=False)
    due_date = Column(DateTime, nullable=True)   # ← new
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("UserDB", back_populates="tasks")