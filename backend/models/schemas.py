from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserRegisterSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

class LocationSchema(BaseModel):
    type: str = "Point"
    coordinates: list[float] = Field(default=[0.0, 0.0], description="[longitude, latitude]")

class OrderCreateSchema(BaseModel):
    order_type: str = Field(default="canteen_delivery")
    item: str = Field(..., min_length=1, max_length=100)
    # Support both simple names and full location objects
    pickup: Optional[str] = None
    drop: Optional[str] = None
    pickup_name: Optional[str] = None
    drop_name: Optional[str] = None
    pickup_location: Optional[LocationSchema] = None
    drop_location: Optional[LocationSchema] = None
    priority: str = Field(default="normal")

