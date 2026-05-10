// tests/e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Fluxo de Identidade Real', () => {
  
  test('Deve exibir estado vazio ao logar pela primeira vez (Sem Fakes)', async ({ page }) => {
    // 1. Setup: Criar usuário real via API de teste
    await page.goto('/login');
    await page.fill('input[name="email"]', 'novo-usuario@bastidor.digital');
    await page.fill('input[name="password"]', 'senha-segura-123');
    await page.click('button[type="submit"]');

    // 2. Validação de Estado Vazio
    await expect(page.locator('text=Seus espaços de convivência')).toBeVisible();
    
    // REGRA DE OURO: Não pode existir "Xepa" ou "Trabalho" se não foram criados
    const bastidoresIniciais = page.locator('.bastidor-card');
    await expect(bastidoresIniciais).toHaveCount(0);
    
    await expect(page.locator('text=Abrir novo Bastidor')).toBeVisible();
  });

  test('Deve persistir identidade local após o login', async ({ page }) => {
    await page.goto('/login');
    // Login...
    
    // Validar se o par de chaves foi gerado no SQLite/IndexedDB
    const isIdentityInDB = await page.evaluate(async () => {
      // Exemplo de verificação no seu DB service
      return !!(await window.db.get('identity_global'));
    });
    expect(isIdentityInDB).toBe(true);
  });
});