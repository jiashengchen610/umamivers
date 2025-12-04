# 如何設置免費的 PostgreSQL 資料庫 (Neon)

由於 Render 的免費資料庫方案有時間限制，我們建議遷移到 **Neon** (https://neon.tech) 或 **Supabase** (https://supabase.com)，這兩個服務都提供永久免費的 PostgreSQL 資料庫方案。

本指南將教你如何使用 Neon。

## 步驟 1：註冊 Neon 帳號

1.  前往 [Neon 官網](https://neon.tech)。
2.  點擊 "Sign Up" 並使用你的 GitHub 或 Google 帳號註冊。

## 步驟 2：建立新專案 (Project)

1.  登入後，點擊 "New Project"。
2.  輸入專案名稱 (例如 `umamivers-db`)。
3.  選擇地區 (Region)，建議選擇離你或你的使用者最近的地區 (例如 `Singapore` 或 `US East`)。
4.  點擊 "Create Project"。

## 步驟 3：獲取連線字串 (Connection String)

1.  專案建立完成後，你會在 Dashboard 看到 "Connection Details"。
2.  確保選擇 **Postgres** 作為資料庫類型。
3.  複製 **Connection String**。它看起來像這樣：
    ```
    postgres://<user>:<password>@<hostname>/<dbname>?sslmode=require
    ```
    **注意**：請確保字串結尾包含 `?sslmode=require`，這對於安全連線很重要。

## 步驟 4：在 Render 設定環境變數

1.  回到 [Render Dashboard](https://dashboard.render.com)。
2.  找到你的 `umamivers-backend` 服務。
3.  點擊 "Environment" 標籤頁。
4.  找到 `DATABASE_URL` 變數。
5.  點擊 "Edit" 並將你從 Neon 複製的連線字串貼上。
6.  點擊 "Save Changes"。

## 步驟 5：重新部署 (Redeploy)

1.  Render 通常會在環境變數變更後自動重新部署。如果沒有，請手動點擊 "Manual Deploy" -> "Deploy latest commit"。
2.  部署完成後，你的應用程式就會連線到新的 Neon 資料庫了。

## (可選) 遷移數據

如果你舊的 Render 資料庫還沒過期，你可能需要將數據遷移過來。這通常需要使用 `pg_dump` 和 `psql` 工具，或者使用資料庫管理工具 (如 DBeaver) 進行匯出匯入。

由於這是新的部署，如果你不介意數據重置，可以直接讓 Django 重新建立資料庫表格 (Render 的 build script 中通常包含了 `python manage.py migrate`)。
