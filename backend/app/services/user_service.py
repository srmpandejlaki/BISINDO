from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.utils.access_token import create_access_token

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

from app.database.models import Admin
from app.schemas.user_schemas import AdminCreate
from app.repositories import UserRepository


class UserService:
    def __init__(self):
        self.user_repository = UserRepository()

    def create_user(self, db: Session, user_data: AdminCreate):

        existing_user = self.user_repository.get_by_username(
            db,
            user_data.username
        )

        if existing_user:
            raise ValueError(
                "Username already exists"
            )

        admin = Admin(
            username=user_data.username,
            password=pwd_context.hash(
                user_data.password
            )
        )

        return self.user_repository.create_user(
            db,
            admin
        )

    def login(
        self,
        db: Session,
        username: str,
        password: str
    ):
        user = self.user_repository.get_by_username(db, username)

        if not user:
            return None

        if not pwd_context.verify(password, user.password):
            return None

        token = create_access_token({
            "idAdmin": user.idAdmin,
            "username": user.username
        })

        return {
            "token": token,
            "user": user
        }