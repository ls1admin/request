from fastapi import APIRouter

from request_server.api.routes import (
    artemis_developer_requests,
    ssh_keys,
    tum_guest_requests,
    vm_access_requests,
    vm_requests,
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(vm_requests.router)
api_router.include_router(vm_access_requests.router)
api_router.include_router(tum_guest_requests.router)
api_router.include_router(artemis_developer_requests.router)
api_router.include_router(ssh_keys.router)
