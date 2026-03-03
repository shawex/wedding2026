# Wedding Landing

## Что внутри
- `index.html` - структура лендинга.
- `styles.css` - адаптивные стили (mobile first).
- `script.js` - музыка, таймер, анимации и отправка RSVP.
- `google-apps-script/Code.gs` - обработчик для записи RSVP в Google Sheets.

## Быстрый запуск
1. Откройте `index.html` в браузере или разместите файлы на хостинге.
2. При необходимости измените дату события в `script.js`:
   - `eventDate: "2026-03-21T16:00:00+09:00"`

## Подключение RSVP к Google Sheets
1. Возьмите ID таблицы из ссылки Google Sheets:
   - `https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit`
2. Откройте `script.google.com`, создайте Apps Script проект.
3. Вставьте код из `google-apps-script/Code.gs`.
4. Укажите:
   - `SHEET_ID = "ваш_ID_таблицы"`
   - при желании имя листа `SHEET_NAME`.
5. Нажмите `Deploy` -> `New deployment` -> `Web app`.
6. Доступ: `Anyone` (или `Anyone with the link`).
7. Скопируйте URL веб-приложения и вставьте его в `script.js`:
   - `rsvpEndpoint: "https://script.google.com/macros/s/.../exec"`

## Опционально: уведомления в Telegram
1. В `google-apps-script/Code.gs` укажите:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
2. Повторно задеплойте Web App.
3. После этого каждое RSVP будет и в таблице, и в Telegram.

## Музыка
- Сейчас подключен ваш файл: `audio/paulyudin-wedding-485932.mp3`.
- Чтобы заменить музыку, поменяйте путь в теге `<audio>` в `index.html`.
