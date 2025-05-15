import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://ten10techtest-dnd6bgfzcqdggver.uksouth-01.azurewebsites.net/Account/Login');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('ptcheng0812@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('Pkh12345678!');
  await page.getByText('RememberMe').click();
  await page.getByRole('button', { name: 'Log in' }).click();
});

test.afterEach(async ({ page }) => {
  await page.close();
})

test('Options able to input', async ({ page }) => {
  await page.getByRole('link', { name: 'Daily' }).click();
  await page.getByRole('link', { name: 'Monthly' }).click();
  await page.getByRole('link', { name: 'Yearly' }).click();

  await page.getByRole('slider', { name: 'Principal Amount:' }).fill('0');
  await page.getByRole('slider', { name: 'Principal Amount:' }).fill('3500');
  await page.getByRole('slider', { name: 'Principal Amount:' }).fill('7500');
  await page.getByRole('slider', { name: 'Principal Amount:' }).fill('11500');
  await page.getByRole('slider', { name: 'Principal Amount:' }).fill('15000');

  await page.getByRole('checkbox', { name: 'Please accept this mandatory' }).check();

  //loop 1- 15% select
  await page.getByRole('button', { name: 'Select Interest Rate' }).click();
  for (let i = 1; i <= 15; i++) {
    if (i != 13) {
      await page.getByRole('checkbox', { name: `${i}%`, exact: true }).check();
    }
  }

});

test('Validate Interest Rate and Total Amount Is Correct', async ({ page }) => {
  for (let i = 1; i <= 15; i++) {
    if (i != 13) {
      await page.getByRole('slider', { name: 'Principal Amount:' }).fill('15000');
      await page.locator('#dropdownMenuButton').click()
      await page.getByRole('checkbox', { name: `${i}%`, exact: true }).check();
      await page.getByLabel(`Selected Rate: ${i}%`).locator('div').filter({ hasText: `${i}%` }).first().click();
      await page.getByRole('link', { name: 'Daily' }).click();
      await page.getByRole('checkbox', { name: 'Please accept this mandatory' }).check();
      await page.getByRole('button', { name: 'Calculate' }).click();
      let interestTextD: string = await page.getByRole('heading', { name: 'Interest Amount:' }).textContent() ?? "";
      let interestD: string = interestTextD?.replace('Interest Amount: ', '').trim() ?? ""
      let totalAmountTextD: string = await page.getByRole('heading', { name: 'Total Amount with Interest:' }).textContent() ?? "";
      let totalAmountD: string = totalAmountTextD?.replace('Total Amount with Interest: ', '').trim() ?? ""
      expect(interestD?.trim()).toMatch(/^\d+\.\d{2}$/);
      expect(totalAmountD?.trim()).toMatch(/^\d+\.\d{2}$/);
      expect(interestD).toBe((parseFloat('0.41') * i).toFixed(2).toString());
      expect(totalAmountD).toBe((parseFloat('0.41') * i + 15000.00).toFixed(2).toString());

      await page.getByRole('link', { name: 'Monthly' }).click();
      await page.getByRole('button', { name: 'Calculate' }).click();
      let interestTextM: string = await page.getByRole('heading', { name: 'Interest Amount:' }).textContent() ?? "";
      let interestM: string = interestTextM?.replace('Interest Amount: ', '').trim() ?? ""
      let totalAmountTextM: string = await page.getByRole('heading', { name: 'Total Amount with Interest:' }).textContent() ?? "";
      let totalAmountM: string = totalAmountTextM?.replace('Total Amount with Interest: ', '').trim() ?? ""
      expect(interestM?.trim()).toMatch(/^\d+\.\d{2}$/);
      expect(totalAmountM?.trim()).toMatch(/^\d+\.\d{2}$/);
      expect(interestM).toBe((parseFloat('15.00') * i).toFixed(2).toString());
      expect(totalAmountM).toBe((parseFloat('15.00') * i + 15000.00).toFixed(2).toString());

      await page.getByRole('link', { name: 'Yearly' }).click();
      await page.getByRole('button', { name: 'Calculate' }).click();
      let interestTextY: string = await page.getByRole('heading', { name: 'Interest Amount:' }).textContent() ?? "";
      let interestY: string = interestTextY?.replace('Interest Amount: ', '').trim() ?? ""
      let totalAmountTextY: string = await page.getByRole('heading', { name: 'Total Amount with Interest:' }).textContent() ?? "";
      let totalAmountY: string = totalAmountTextY?.replace('Total Amount with Interest: ', '').trim() ?? ""
      expect(interestY?.trim()).toMatch(/^\d+\.\d{2}$/);
      expect(totalAmountY?.trim()).toMatch(/^\d+\.\d{2}$/);
      expect(interestY).toBe((parseFloat('150.00') * i).toFixed(2).toString());
      expect(totalAmountY).toBe((parseFloat('150.00') * i + 15000.00).toFixed(2).toString());
    }
  }
});

test('Verify Error Dialogue Message when Inputs are empty or not selected', async ({ page }) => {
  //Without select % and mandatory checkbox not ticked
  page.once('dialog', dialog => {
    const message = dialog.message();
    console.log(`Dialog message: ${message}`);
    expect(message).toBe("Please fill in all fields.");
    dialog.dismiss().catch(() => { });
  });
  await page.getByRole('button', { name: 'Calculate' }).click();

  //Selected % and mandatory checkbox not ticked
  await page.getByRole('button', { name: 'Select Interest Rate' }).click();
  await page.getByRole('checkbox', { name: '1%', exact: true }).check();
  await page.getByLabel('Selected Rate: 1%').locator('div').filter({ hasText: '1%' }).first().click();

  page.once('dialog', dialog => {
    const message = dialog.message();
    console.log(`Dialog message: ${message}`);
    expect(message).toBe("Please fill in all fields.");
    dialog.dismiss().catch(() => { });
  });
  await page.getByRole('button', { name: 'Calculate' }).click();
});


test('Show error messages for empty fields', async ({ page }) => {
  await page.getByRole('button', { name: 'Calculate' }).click();
  const errorMessages = await page.locator('.error-message').allTextContents();

  expect(errorMessages).toContain('Interest rate must be selected');
  expect(errorMessages).toContain('Consent is required');
});
