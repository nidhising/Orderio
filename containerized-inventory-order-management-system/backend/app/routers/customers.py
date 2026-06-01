from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("", response_model=schemas.CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    """Create a new customer."""
    return crud.create_customer(db=db, customer=customer)


@router.get("", response_model=List[schemas.CustomerResponse])
def list_customers(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    """Retrieve all customers."""
    return crud.get_customers(db=db, skip=skip, limit=limit)


@router.get("/{customer_id}", response_model=schemas.CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    """Retrieve a customer by ID."""
    return crud.get_customer(db=db, customer_id=customer_id)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    """Delete a customer."""
    crud.delete_customer(db=db, customer_id=customer_id)
