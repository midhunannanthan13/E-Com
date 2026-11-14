# ShopSphere: Local MySQL first, then Google Login and Aiven Cloud
### Setup guide, about 35 minutes, 8 short parts in 2 phases

**The plan**
- **Phase A: run it on your own computer** with MySQL Workbench (Parts 1 to 6). You add Google login and see the whole shop working locally.
- **Phase B: move the database to Aiven** (Parts 7 and 8). Same shop, now with a free cloud database.

**What does NOT change:** the shop's look, all 7 departments, all 48 products, the cart, checkout, orders, wishlist and admin pages work exactly as before. Normal username and password sign-in still works.

> **How to use this guide:** do the parts in order. Each part ends with a ✅ checkpoint. If yours does not match, stop and use the Troubleshooting table at the end.

---

## Before you start (3 min)
| You need | Check with | You should see |
|---|---|---|
| Python | `python --version` | 3.10 or newer |
| Node.js | `node --version` | 18 or newer |
| WAMP running | the WAMP icon in the taskbar | **green** (if not, start all services) |
| MySQL Workbench | open it | a card named **Local instance wampmysqld** |
| A Google account | n/a | the one that owns your Google Cloud project |

Unzip the project and open the folder that contains `backend` and `frontend` in your terminal (for example `M:\shop\shopsphere`). **Every command below starts from that folder.**

> **Using PowerShell** (the terminal inside VS Code or Antigravity)? If `venv\Scripts\activate` says scripts are disabled, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` once in that terminal, then `venv\Scripts\Activate.ps1`.

---

# PHASE A: Run it locally

## Part 1: Create the local database in MySQL Workbench (3 min)
Your project is already set to connect with **user `root`, password `dexter`, `localhost`, port `3306`**. You only need to create an empty database.

1. Open **MySQL Workbench**.
2. Double-click the card **Local instance wampmysqld** (user `root`, `localhost:3306`).
3. In the "Please enter password" window, type **`dexter`** and click **OK**. (Tick **Save password in vault** if you do not want to type it again.)
4. A SQL window opens. Paste this, then click the **lightning bolt** ⚡ button to run it:
   ```sql
   CREATE DATABASE shopsphere_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

✅ **Checkpoint:** run `SHOW DATABASES;` and you see `shopsphere_db` in the list.

**Next: Part 2.**

---

## Part 2: Add the Django address to Google (4 min)
You already have a Google OAuth client. **Keep it.** You only add one more address (a *redirect URI*) so Google may send shoppers back to this shop.

1. Open **https://console.cloud.google.com** and select your project.
2. Go to **Google Auth Platform, then Clients** (older view: **APIs & Services, then Credentials**).
3. Open your existing **OAuth 2.0 Client ID**.
4. Under **Authorized redirect URIs** click **+ Add URI** and paste exactly:
   ```
   http://127.0.0.1:8000/api/auth/google/callback/
   ```
   Copy it character for character, including the final `/`. One wrong character causes `redirect_uri_mismatch`.
5. Click **Save**. Google can take a few minutes to apply it.
6. Copy your **Client ID** and **Client Secret** for Part 3. If Google no longer shows the secret, click **Add secret** on the same page.
7. If your consent screen is in **Testing** mode, open **Audience, then Test users** and add every Gmail address that should be able to sign in.

✅ **Checkpoint:** the new address is listed, and you have your Client ID and Secret.

**Next: Part 3.**

---

## Part 3: Paste your two Google keys into `.env` (2 min)
**Where is `.env`?** It is already in the zip, at `backend/.env`. It is a private settings file, so it is not shown on GitHub, and some tools hide files that start with a dot. In your code editor's file list it appears inside the `backend` folder, next to `manage.py`. (`.env.example` is only a blank template; you do not need it.)

**Why it exists:** it keeps your secret keys out of the code, so you can share the project without sharing your keys.

1. Open `backend/.env`.
2. After `GOOGLE_CLIENT_ID=` paste your Client ID. After `GOOGLE_CLIENT_SECRET=` paste your Client Secret. No quotes, no spaces.
3. **Leave the Aiven lines alone** (they start with `#`). That is for Phase B.
4. Save the file.

If `.env` is missing, make it from the template: `copy .env.example .env` (Windows) or `cp .env.example .env` (Mac/Linux).

⚠️ **Never** email, upload or screenshot `.env`. The included `.gitignore` keeps it out of GitHub.

✅ **Checkpoint:** both Google values are filled in, and the file is saved.

**Next: Part 4.**

---

## Part 4: Start the backend (5 min)
Open a terminal and run these **one at a time**.

**Windows (Command Prompt or PowerShell):**
```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python check_setup.py
python manage.py migrate
python manage.py seed
python manage.py createsuperuser
python manage.py runserver
```
**Mac / Linux:**
```
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python check_setup.py
python manage.py migrate
python manage.py seed
python manage.py createsuperuser
python manage.py runserver
```
- `pip install -r requirements.txt` installs everything the backend needs.
- `python check_setup.py` is a health check. It prints `OK` or `FIX` lines for your `.env`, the database and the Google keys. Fix every `FIX` line before you continue.
- `migrate` creates the tables in `shopsphere_db`.
- `seed` fills the shop: **7 departments and 48 products**, with product images.
- `createsuperuser` makes your admin login (optional, recommended).
- `runserver` starts the backend. **Leave this window open.**

✅ **Checkpoint:** `seed` prints `Done. Categories: 7 added. Products: 48 created`, and this page shows product data: http://127.0.0.1:8000/api/products/products/
In Workbench, run `USE shopsphere_db; SHOW TABLES;` and you see tables such as `products_product` and `accounts_user`.

**Next: Part 5.**

---

## Part 5: Start the shop website (4 min)
Open a **second** terminal in the same project folder (keep the first one running):
```
cd frontend
npm install
npm start
``` The first `npm install` takes a few minutes. Your browser opens **http://localhost:3000**. Use `localhost:3000` for the shop and `127.0.0.1:8000` for the backend, exactly as shown.

✅ **Checkpoint:** you see the shop with all 7 departments and product pictures.

**Next: Part 6.**

---

## Part 6: Try Google login (2 min)
1. Click **Sign in**. Under the form you see an **or** line and a **Continue with Google** button.
2. Click it, choose your Google account, and approve.
3. You land back in the shop, signed in. Add something to the cart to confirm it works.

✅ **Checkpoint:** you are signed in. In Workbench run `SELECT id, username, email FROM shopsphere_db.accounts_user;` and your Google email is in the list.

🎉 **Phase A is done.** The shop works fully on your computer. **Next: Phase B, Part 7.**

---

# PHASE B: Move the database to Aiven (cloud)

## Part 7: Create the free Aiven database (6 min)
1. Go to **https://console.aiven.io** and sign in.
2. Click **Create service** and choose **MySQL**.
3. Choose the **Free** plan (if it is not shown, pick the smallest plan), then the region closest to you.
4. Name it `shopsphere-db` and click **Create service**. Wait until the status is **Running**.
5. Open the service **Overview** page and note **Host**, **Port**, **User** (normally `avnadmin`) and **Password**. The database name is normally `defaultdb`.
6. On the same page, click **Download** next to **CA Certificate**. Save it as **`ca.pem`** inside the `backend/certs/` folder.

✅ **Checkpoint:** `backend/certs/ca.pem` exists, and you have Host, Port and Password.

**Next: Part 8.**

---

## Part 8: Switch the shop to Aiven (4 min)
1. Open `backend/.env`.
2. In the **PHASE B** section, delete the `# ` at the start of these lines and fill in your Aiven values: `AIVEN_DB_HOST`, `AIVEN_DB_PORT`, `AIVEN_DB_PASSWORD`, `AIVEN_DB_USER`, `AIVEN_DB_NAME`, `AIVEN_DB_CA_PATH`. Save.
3. In the backend terminal press **Ctrl+C** to stop it, then run:
   ```
   python check_setup.py
   python manage.py migrate
   python manage.py seed
   python manage.py createsuperuser
   python manage.py runserver
   ```
   `check_setup.py` should now say **Using: AIVEN cloud** and **connected to the database**.
   The Aiven database starts **empty**, so `migrate` and `seed` run again. Your local users and orders are not copied. (To keep them, export them from Workbench with **Server, Data Export** and import into Aiven.)
4. Refresh **http://localhost:3000**, then sign in with Google again.

✅ **Final checkpoint:** the shop looks identical, and in the Aiven Console (or Workbench connected to Aiven) the table `accounts_user` shows your email.

**To go back to local at any time:** put `# ` back in front of the Aiven lines in `.env` and restart the backend.

🎉 **Done.** Next step: send your client the link to the running shop, or ask us to help put it on a public web address.

---

## Make a Google user an admin (optional)
New users are normal customers. To let someone manage products, run this in the `backend` folder, replacing the email:
```
python manage.py shell -c "from django.contrib.auth import get_user_model as g; u=g().objects.get(email='you@gmail.com'); u.is_staff=True; u.save()"
```
Sign out and back in. A **Manage** link appears in the menu.

---

## Troubleshooting
| What you see | Why | Fix |
|---|---|---|
| Workbench: "Can't connect to MySQL server on localhost:3306" | WAMP is not running | Start WAMP and wait for the **green** icon, then retry. |
| "Access denied for user 'root'" | Wrong password | The project expects `dexter`. If your MySQL root password is different, tell us and we will update it. |
| `migrate` says `Unknown database 'shopsphere_db'` | Part 1 was skipped | Run the `CREATE DATABASE` line from Part 1 in Workbench. |
| Google page says `redirect_uri_mismatch` | Address differs from the app | Re-copy it from Part 2 step 4 (final `/`, and `127.0.0.1` not `localhost`). Wait 5 minutes. |
| Google says "Access blocked" or "app not verified" | Consent screen is in Testing mode | Add your Gmail under **Audience, then Test users**. |
| Button says "Google sign-in is not set up yet" | `.env` missing or keys empty | Redo Part 3, then restart the backend. |
| `pip install` fails on `mysqlclient` | Your computer cannot build that driver | Run `pip install pymysql cryptography`. The project switches to it automatically. Then rerun `pip install -r requirements.txt`. |
| Aiven: `migrate` hangs or cannot connect | Wrong Host or Port, service powered off, or IP filter | Re-check Host and Port. In Aiven make sure the service is **Running** and **Allowed IP addresses** includes yours. |
| SSL or certificate error on Aiven | `ca.pem` missing or misplaced | Put it at `backend/certs/ca.pem` (Part 7 step 6). |
| `ModuleNotFoundError` | Virtual environment not active | Run `venv\Scripts\activate` (Windows) or `source venv/bin/activate`, then retry. |
| `.env` seems missing | Hidden dot-file, or not copied | It is at `backend/.env` (next to `manage.py`). If truly missing, run `copy .env.example .env`. |
| `venv\Scripts\activate` says scripts are disabled | PowerShell security setting | Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`, then `venv\Scripts\Activate.ps1`. |
| `check_setup.py` shows `FIX` | Something in `.env`, the database or Google is not ready | Read the FIX line; it names the problem. Fix it and run the check again. |
| Product pictures are blank | Pictures load from the internet (Unsplash) | Check your connection or ad-blocker. |

## Good to know
- **Product pictures** are web links saved in the database by `seed`, same as your original project. They are not files in the zip.
- **Same email, same account.** A shopper who first signed up with a password and later uses Google with the same email keeps the same account, orders and cart.
- **Before going live,** your original `settings.py` is untouched and still has a development `SECRET_KEY`, `DEBUG = True` and the local database password `dexter`. Change them for a public launch.
- **If a Google secret was ever pasted into a document or chat,** treat it as exposed: in Google Cloud, add a new secret and delete the old one.

## Exactly what was added (nothing else changed)
**New files:** `backend/accounts/google_oauth.py`, `backend/accounts/google_urls.py`, `backend/.env` (ready to fill in), `backend/.env.example`, `backend/check_setup.py`, `backend/certs/README.txt`, `frontend/src/components/GoogleButton.js`, `frontend/src/pages/GoogleCallback.js`, `frontend/src/styles/google.css`, `.gitignore`, this guide.
**Small additions to existing files:** `settings.py` (reads `.env`, Aiven switch, Google values), `ecommerce_backend/urls.py` (1 line), `requirements.txt` (1 line: `python-dotenv`), `frontend/src/App.js` (1 import, 1 route), `SignIn.js` and `SignUp.js` (the Google button).
