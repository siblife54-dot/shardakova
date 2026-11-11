"use strict";

const plansList = document.getElementById("plans-list");
const currency = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

window.LANDING_CONFIG.plans.forEach((plan, index) => {
  const isBundle = plan.isBundle === true;
  const card = document.createElement("article");
  card.className = isBundle ? "plan plan-bundle" : "plan";
  card.id = plan.id;
  card.setAttribute("aria-labelledby", `${plan.id}-title`);

  if (!isBundle && plan.image) {
    const photo = document.createElement("div");
    photo.className = "plan-photo";
    const image = document.createElement("img");
    image.src = plan.image;
    image.alt = "";
    image.width = 866;
    image.height = 1280;
    image.loading = "lazy";
    image.decoding = "async";
    image.style.objectPosition = plan.imagePosition || "50% 50%";
    image.style.transformOrigin = plan.imagePosition || "50% 50%";
    photo.style.setProperty("--photo-scale", String(plan.imageScale || 1));
    photo.append(image);
    card.append(photo);
  }

  const content = document.createElement("div");
  content.className = "plan-copy";
  const label = document.createElement("p");
  label.className = isBundle ? "plan-offer-label" : "plan-number";
  label.textContent = isBundle ? "Специальное предложение" : `${String(index + 1).padStart(2, "0")}.`;
  if (!isBundle) label.setAttribute("aria-hidden", "true");

  const title = document.createElement("h3");
  title.id = `${plan.id}-title`;
  title.textContent = plan.name;

  const price = document.createElement("div");
  price.className = "plan-price";

  const currentPrice = document.createElement("span");
  currentPrice.className = "plan-current-price";
  currentPrice.textContent = currency.format(plan.price);
  price.append(currentPrice);

  const discount = document.createElement("span");
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
    discount.textContent = `−${percent}%`;
    discount.setAttribute("aria-label", `Скидка примерно ${percent}%`);
  }
  price.append(discount);

  const description = document.createElement("p");
  description.className = "plan-description";
  description.textContent = plan.description;

  const button = document.createElement("button");
  button.className = "button";
  button.type = "button";
  button.textContent = isBundle ? "Выбрать комплект" : "Выбрать программу";
  button.setAttribute("aria-label", `Купить: ${plan.name}`);

  const message = document.createElement("p");
  message.className = "plan-message";
  message.setAttribute("role", "status");
  message.setAttribute("aria-atomic", "true");

  // Пока материалы или страница оплаты не готовы, запрещаем оформление заказа.
  const canBuy = plan.contentReady === true && Boolean(plan.paymentUrl?.trim());
  if (!canBuy) {
    button.disabled = true;
    if (!isBundle) {
      button.textContent = "Скоро";
      message.textContent = plan.contentReady ? "Подключаем оплату" : "Программа готовится";
    }
  }

  button.addEventListener("click", () => {
    if (!canBuy) return;
    const paymentUrl = plan.paymentUrl.trim();

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

  content.append(label, title, description, price, button, message);
  card.append(content);
  plansList.append(card);
});
