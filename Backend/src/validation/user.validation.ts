import Joi from 'joi';

export const registerSchema = Joi.object({

    name: Joi.string()
    .trim() 
    .pattern(/^[A-Za-z]+(?:\s[A-Za-z]+)*$/) 
    .min(3)
    .required()
    .messages({
        'string.pattern.base': 'Name must only contain alphabets and cannot start/end with a space',
        'string.empty': 'Name cannot be empty',
        'string.min': 'Name must be at least 3 characters long',
        'any.required': 'Name is required'
    }),
    email: Joi.string()
        .trim()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is a required field'
        }),

   
    password: Joi.string()
        .pattern(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[^\s]+$/)
        .trim()
        .min(8)
        .required()
        .messages({
            'string.pattern.base': 'Password must include at least one letter, one number, and one special character with no spaces',
            'string.min': 'Password must be at least 8 characters long',
            'any.required': 'Password is a required field'
        })
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required for login'
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required for login'
    })
});

export const createBoxSchema = Joi.object({

    name: Joi.string()
        .trim()
        .pattern(/^[A-Za-z]+$/) 
        .max(10)
        .required()
        .messages({
            'string.pattern.base': 'Box name must only contain alphabets',
            'string.max': 'Box name cannot exceed 10 characters',
            'string.empty': 'Box name is required',
            'any.required': 'Box name is required'
        }),
  
    description: Joi.string().max(100).optional()
});