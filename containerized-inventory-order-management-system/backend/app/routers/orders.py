from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    """Create a new order. Automatically reduces product stock."""
    return crud.create_order(db=db, order_in=order)


@router.get("", response_model=List[schemas.OrderListResponse])
def list_orders(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    """Retrieve all orders."""
    return crud.get_orders(db=db, skip=skip, limit=limit)


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Retrieve order details including all line items."""
    return crud.get_order(db=db, order_id=order_id)


@router.patch("/{order_id}/status", response_model=schemas.OrderListResponse)
def update_order_status(order_id: int, status_update: schemas.OrderStatusUpdate, db: Session = Depends(get_db)):
    """Update the status of an order (pending → confirmed or cancelled)."""
    return crud.update_order_status(db=db, order_id=order_id, new_status=status_update.status)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Cancel and delete an order, restoring product stock."""
    crud.delete_order(db=db, order_id=order_id)
