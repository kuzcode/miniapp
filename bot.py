import urllib.parse
import logging
from telegram import Update, KeyboardButton, ReplyKeyboardMarkup, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
from appwrite.client import Client
from appwrite.services.databases import Databases

TOKEN = '7607745555:AAGH6HZiiadyRw1YifMUyMfiGgYkghBxWDE'
MINIAPP_URL = 'https://miniapp-mu-one.vercel.app/'

# Appwrite configuration
PROJECT_ID = '68518394002460beefca'
DATABASE_ID = '6851839e00173225abcd'
USER_COLLECTION_ID = '6889e61a00170d6e2c24'
REF_COLLECTION_ID = '6889e62e002bb0d86b4e'
API_KEY = 'standard_b1b9f8ada142c5ed3c4233da039ba13c186328787c62958319995460acaa98e96ceafe380ed9e731ab60f9fc3fb5e8978cd3bfe0efd77b447feffbedcd8c917d00d438206cb86bf8790c90dc518633c3b0c03cb91c03407f1a1c8e9874b9820ec44bfb3850537ab1a2c60e4cbbfbae4ea7ff51d509fe77364fb714a73e4af9e4'

# Logging setup
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Initialize Appwrite client
client = Client()\
    .set_endpoint("https://cloud.appwrite.io/v1")\
    .set_project(PROJECT_ID)\
    .set_key(API_KEY)
databases = Databases(client)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.message.from_user
    user_id = str(user.id)
    # collect user info
    first_name = user.first_name or ''
    last_name = user.last_name or ''
    username = user.username or ''
    avatar = ''
    # attempt to fetch avatar URL
    try:
        photos = await context.bot.get_user_profile_photos(user.id, limit=1)
        if photos.total_count > 0:
            file_id = photos.photos[0][-1].file_id
            file = await context.bot.get_file(file_id)
            avatar = f"https://api.telegram.org/file/bot{TOKEN}/{file.file_path}"
    except Exception:
        pass

    # send welcome before any DB calls
    params = {
        'user_id': user_id,
        'first_name': first_name,
        'last_name': last_name,
        'username': username,
        'avatar': avatar,
    }
    query = "&".join(f"{k}={urllib.parse.quote(str(v))}" for k, v in params.items())
    web_app_url = f"{MINIAPP_URL}?{query}"
    keyboard = [
        [KeyboardButton(text='Открыть маркет 🏪', web_app=WebAppInfo(url=web_app_url))]
    ]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    await update.message.reply_text(
        'Добро пожаловать в Incognito. Нажми на кнопку ниже, чтобы открыть маркет.',
        reply_markup=reply_markup
    )

    # referral via deep link
    referral_id = context.args[0] if context.args else None

    # check/add user
    new_user = False
    try:
        databases.get_document(DATABASE_ID, USER_COLLECTION_ID, user_id)
    except Exception:
        user_data = {
            "id": int(user_id),
            "username": username
        }
        if referral_id:
            user_data["ownerid"] = int(referral_id)
        databases.create_document(
            database_id=DATABASE_ID,
            collection_id=USER_COLLECTION_ID,
            document_id=user_id,
            data=user_data
        )
        new_user = True

    # notify referrer and update referrals count
    if new_user and referral_id:
        try:
            ref_doc = databases.get_document(DATABASE_ID, REF_COLLECTION_ID, referral_id)
            current = ref_doc.get("referals", 0)
            new_count = current + 1
            databases.update_document(
                database_id=DATABASE_ID,
                collection_id=REF_COLLECTION_ID,
                document_id=referral_id,
                data={"referals": new_count}
            )
            await context.bot.send_message(
                chat_id=int(referral_id),
                text=(
                    f'У вас новый реферал: @{username or user_id}. '
                    f'Теперь у вас {new_count} рефералов.'
                )
            )
        except Exception as e:
            await context.bot.send_message(
                chat_id=int(referral_id),
                text=f'Ошибка при обновлении рефералов: {e}'
            )

async def error_handler(update: object, context: ContextTypes.DEFAULT_TYPE):
    logger.error("Exception while handling an update", exc_info=context.error)

if __name__ == '__main__':
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler('start', start))
    app.add_error_handler(error_handler)
    app.run_polling()