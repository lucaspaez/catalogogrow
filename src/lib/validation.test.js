import { describe, it, expect } from 'vitest';
import { emailSchema, passwordSchema, productSchema } from './validation.js';


describe('emailSchema', () => {
    it('valida emails correctos', () => {
        expect(emailSchema.parse('test@example.com')).toBe('test@example.com');
        expect(emailSchema.parse('user.name+tag@example.co.uk')).toBe('user.name+tag@example.co.uk');
    });

    it('rechaza emails inválidos', () => {
        expect(() => emailSchema.parse('invalid')).toThrow();
        expect(() => emailSchema.parse('missing@domain')).toThrow();
        expect(() => emailSchema.parse('@example.com')).toThrow();
        expect(() => emailSchema.parse('test@')).toThrow();
    });

    it('rechaza emails vacíos', () => {
        expect(() => emailSchema.parse('')).toThrow();
    });
});

describe('passwordSchema', () => {
    it('valida passwords seguros', () => {
        const validPassword = 'MyPass123!';
        expect(passwordSchema.parse(validPassword)).toBe(validPassword);
    });

    it('rechaza passwords muy cortos', () => {
        expect(() => passwordSchema.parse('Short1!')).toThrow(/Mínimo 8 caracteres/);
    });

    it('rechaza passwords sin mayúscula', () => {
        expect(() => passwordSchema.parse('mypass123!')).toThrow(/mayúscula/);
    });

    it('rechaza passwords sin minúscula', () => {
        expect(() => passwordSchema.parse('MYPASS123!')).toThrow(/minúscula/);
    });

    it('rechaza passwords sin número', () => {
        expect(() => passwordSchema.parse('MyPassword!')).toThrow(/número/);
    });

    it('rechaza passwords sin carácter especial', () => {
        expect(() => passwordSchema.parse('MyPassword123')).toThrow(/carácter especial/);
    });
});

describe('productSchema', () => {
    const validProduct = {
        name: 'Producto Test',
        description: 'Descripción del producto',
        price: 100,
        category: 'Accesorios',
        image: 'https://example.com/image.jpg',
        minOrder: 1,
        active: true,
        volumeDiscounts: []
    };

    it('valida productos correctos', () => {
        const result = productSchema.parse(validProduct);
        expect(result.name).toBe('Producto Test');
        expect(result.price).toBe(100);
    });

    it('rechaza nombres muy cortos', () => {
        expect(() => productSchema.parse({ ...validProduct, name: 'AB' })).toThrow(/Mínimo 3 caracteres/);
    });

    it('rechaza nombres muy largos', () => {
        const longName = 'A'.repeat(101);
        expect(() => productSchema.parse({ ...validProduct, name: longName })).toThrow(/Máximo 100 caracteres/);
    });

    it('trim nombres con espacios', () => {
        const result = productSchema.parse({ ...validProduct, name: '  Producto  ' });
        expect(result.name).toBe('Producto');
    });

    it('rechaza precios negativos', () => {
        expect(() => productSchema.parse({ ...validProduct, price: -10 })).toThrow(/no puede ser negativo/);
    });

    it('rechaza categorías inválidas', () => {
        expect(() => productSchema.parse({ ...validProduct, category: 'Invalida' })).toThrow();
    });

    it('acepta categorías válidas', () => {
        const categories = ['Estructuras', 'Cultivo', 'Ventilación', 'Accesorios'];
        categories.forEach(category => {
            const result = productSchema.parse({ ...validProduct, category });
            expect(result.category).toBe(category);
        });
    });

    it('rechaza minOrder menor a 1', () => {
        expect(() => productSchema.parse({ ...validProduct, minOrder: 0 })).toThrow(/Mínimo 1/);
    });

    it('rechaza minOrder decimal', () => {
        expect(() => productSchema.parse({ ...validProduct, minOrder: 1.5 })).toThrow(/entero/);
    });

    it('valida descuentos por volumen', () => {
        const withDiscounts = {
            ...validProduct,
            volumeDiscounts: [
                { threshold: 10, price: 90 },
                { threshold: 50, price: 80 }
            ]
        };
        const result = productSchema.parse(withDiscounts);
        expect(result.volumeDiscounts).toHaveLength(2);
    });

    it('rechaza descuentos con threshold negativo', () => {
        const withDiscounts = {
            ...validProduct,
            volumeDiscounts: [{ threshold: -1, price: 90 }]
        };
        expect(() => productSchema.parse(withDiscounts)).toThrow(/positivo/);
    });

    it('acepta imagen vacía', () => {
        const result = productSchema.parse({ ...validProduct, image: '' });
        expect(result.image).toBe('');
    });

    it('rechaza URLs de imagen inválidas', () => {
        expect(() => productSchema.parse({ ...validProduct, image: 'not-a-url' })).toThrow(/URL/);
    });
});
