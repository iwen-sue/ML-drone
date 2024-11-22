# Project Requirements

| Method | End Point | Desc |
| --- | --- | --- |
| POST | /signup | User sign up |
| POST | /login | User log in |
| POST | /generate-image | Generate image for sketch |
| GET | /users | Admin view for users data |
| GET | /api-calls | Admin view for API request count for all 8 endpoints |
| GET | /requests | Users’ view for their req count |
| Delete | /delete-account | Users’ method to delete their account |
| PUT/PATCH | /change-passowrd | User/Admin’s method to change their own password |

# Admin’s tables

## APIs stats

| Method | Endpoint | Requests |
| --- | --- | --- |
| POST | /signup | 100 |
| GET | /users | 500 |
| … | … | … |

## User’s stats

(To keep it simple, calculate the calls to `/generate-image`)

| User Name | Email | Total Request # |
| --- | --- | --- |
| grace2268 | grace2268@hotmail.com | 20 |
| … | … | … |