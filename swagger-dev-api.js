export const swaggeroptions={
    "swagger": "2.0",
    "info": {
        "description": "API Documentation",
        "version": "1.0.0",
        "title": "WEAV-API"
    },
    "host": "localhost:8080",
    "tags": [
        {
            "name": "WEAV API",
            "description": "WEAV API list is used to manage all the API's"
        }
    ],
    "schemes": [
        "http"
    ],
    "paths": {
        "/api/user/adduser": {
            "post": {
                "tags": [
                    "User Management"
                ],
                "description": "Create user",
                "parameters": [
                    {
                        "in": "body",
                        "name": "body",
                        "description": "Add users",
                        "schema": {
                            "$ref": "#/definitions/adduser"
                        }
                    }
                ],
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "responses": {
                    "200": {
                        "description": "The request is OK"
                    },
                    "400": {
                        "description": "Bad Request"
                    },
                    "401": {
                        "description": "Authorization failed"
                    },
                    "404": {
                        "description": "Not Found"
                    },
                    "408": {
                        "description": "Request Timeout"
                    },
                    "500": {
                        "description": "Internal Server Error"
                    },
                    "504": {
                        "description": "Gateway Timeout"
                    }
                }
            }
        }
    },
    "definitions": {
        "adduser": {
            "required": [
                "first_name",
                "last_name",
                "email",
                "organization"
            ],
            "properties": {
                "first_name": {
                    "type": "string",
                    "example": "Test"
                },
                "last_name": {
                    "type": "string",
                    "example": "Test"
                },
                "email": {
                    "type": "string",
                    "example": "test@konverge.ai"
                },
                "organization": {
                    "type": "string",
                    "example": "The Logan Group, Inc"
                }
            }
        }
    }
}