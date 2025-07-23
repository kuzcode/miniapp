from telegram import Update, KeyboardButton, ReplyKeyboardMarkup, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

TOKEN = '7607745555:AAGH6HZiiadyRw1YifMUyMfiGgYkghBxWDE'
MINIAPP_URL = 'https://miniapp-mu-one.vercel.app/'

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [KeyboardButton(text='🚀 Запустить мини-апп', web_app=WebAppInfo(url=MINIAPP_URL))]
    ]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    await update.message.reply_text(
        'Привет! Нажми на кнопку ниже, чтобы открыть мини-апп.',
        reply_markup=reply_markup
    )

if __name__ == '__main__':
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler('start', start))
    app.run_polling() 