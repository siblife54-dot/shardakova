"use strict";

const plansList = document.getElementById("plans-list");
const currency = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

window.LANDING_CONFIG.plans.forEach((plan) => {
  const card = document.createElement("article");
  card.className = "plan";
  card.id = plan.id;
  card.setAttribute("aria-labelledby", `${plan.id}-title`);

  const title = document.createElement("h3");
  title.id = `${plan.id}-title`;
  title.textContent = plan.name;

  const price = document.createElement("p");
  price.className = "plan-price";

  const currentPrice = document.createElement("span");
  currentPrice.className = "plan-current-price";
  currentPrice.textContent = currency.format(plan.price);
  price.append(currentPrice);

  const discount = document.createElement("p");
  discount.className = "plan-discount";
  if (plan.oldPrice > plan.price) {
    const oldPrice = document.createElement("s");
    oldPrice.className = "plan-old-price";
    const oldPriceLabel = document.createElement("span");
    oldPriceLabel.className = "visually-hidden";
    oldPriceLabel.textContent = "Прежняя цена: ";
    oldPrice.append(oldPriceLabel, currency.format(plan.oldPrice));
    price.append(oldPrice);

    const percent = Math.round((1 - plan.price / plan.oldPrice) * 100);
    discount.textContent = `Скидка ≈ ${percent}%`;
  }

  const description = document.createElement("p");
  description.className = "plan-description";
  description.textContent = plan.description;

  const button = document.createElement("button");
  button.className = "button";
  button.type = "button";
  button.textContent = "Купить";
  button.setAttribute("aria-label", `Купить: ${plan.name}`);

  const message = document.createElement("p");
  message.className = "plan-message";
  message.setAttribute("role", "status");
  message.setAttribute("aria-atomic", "true");

  button.addEventListener("click", () => {
    const paymentUrl = plan.paymentUrl.trim();
    if (!paymentUrl) {
      message.textContent = "Оплата скоро будет доступна";
      return;
    }

    // Только переход к оплате. Ни URL, ни редирект не подтверждают покупку.
    let destination;
    try {
      destination = new URL(paymentUrl);
      if (destination.protocol !== "https:" || destination.username || destination.password) {
        throw new Error("Ожидается публичная HTTPS-ссылка оплаты");
      }
    } catch {
      message.textContent = "Ссылка оплаты пока недоступна";
      return;
    }
    window.location.assign(destination.href);
  });

  card.append(title, price, discount, description, button, message);
  plansList.append(card);
});
