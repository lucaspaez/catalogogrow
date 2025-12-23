import { z } from 'zod';

export const emailSchema = z.string()
    .email('Email inválido')
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Formato de email inválido');

export const passwordSchema = z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial');

export const productSchema = z.object({
    name: z.string()
        .min(3, 'Mínimo 3 caracteres')
        .max(100, 'Máximo 100 caracteres')
        .trim(),
    description: z.string()
        .max(500, 'Máximo 500 caracteres')
        .trim(),
    price: z.number()
        .min(0, 'El precio no puede ser negativo')
        .finite('El precio debe ser un número válido'),
    category: z.enum(['Estructuras', 'Cultivo', 'Ventilación', 'Accesorios']),
    image: z.string().url('URL de imagen inválida').or(z.literal('')),
    minOrder: z.number()
        .int('Debe ser un número entero')
        .min(1, 'Mínimo 1'),
    active: z.boolean(),
    volumeDiscounts: z.array(
        z.object({
            threshold: z.number().int().positive('Debe ser positivo'),
            price: z.number().min(0, 'No puede ser negativo')
        })
    ).default([])
});
