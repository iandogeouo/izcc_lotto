# 大樂透模擬網站

本機執行的大樂透模擬全端專案，包含玩家頁面（唯讀、免登入）與管理後台（模擬下注操作、開獎，免登入）。

- 前端 + 後端：Next.js（App Router）+ TypeScript
- 資料庫：SQLite（透過 Prisma ORM）
- 測試：Vitest

## 安裝與啟動

```bash
# 1. 安裝套件
npm install

# 2. 建立資料庫（第一次執行）並套用資料表結構
npx prisma migrate dev

# 3. 匯入測試資料（5 位玩家 + 3 期歷史開獎 + 1 期目前尚未開獎的期別）
npx prisma db seed

# 4. 啟動開發伺服器
npm run dev
```

啟動後開啟 http://localhost:3000：

- `/`：玩家頁面（開獎號碼、獎池、中獎說明、下注統計、查詢我的下注、歷史紀錄）
- `/admin`：管理後台（新增下注、下注紀錄管理、觸發開獎、參數設定），**需要密碼登入**
  - 下注紀錄頁可「清空本期下注」（僅限尚未開獎的期別）
  - 每一期歷史紀錄可點進去看該期所有玩家的下注與對獎明細（`/admin/draws/[期別]`）

### 管理後台密碼

管理後台已加上簡單的密碼保護（`/admin/login`），密碼設定在 `.env` 的 `ADMIN_PASSWORD`（改密碼後要重啟伺服器才會生效）。登入後會在瀏覽器存一個 7 天有效的 httpOnly cookie，右上角「登出」可以隨時登出。

這是給單一管理者使用的簡單防護（沒有帳號系統、沒有多人權限管理），足以避免被路過的人看到或誤操作，但**不是**正式上線等級的安全機制，請勿存放真正敏感的資料。**如果要公開到網路上給別人連（見下方部署章節），請務必先把 `ADMIN_PASSWORD` 改成不是預設值的密碼。**

### 重新產生乾淨的測試資料

如果想清空資料庫、恢復成剛安裝好的示範狀態，**這是兩個指令，缺一不可**：

```bash
npx prisma migrate reset --force
npx prisma db seed
```

⚠️ **`migrate reset` 本身不會自動重新 seed**（Prisma 7 的行為，跟舊版不一樣），如果只跑第一行、忘記跑第二行，資料庫會是完全空的（連玩家名單都會不見）。

不過玩家名單有做自我修復：只要資料表被清空，下次讀取頁面時會自動補回固定的 5 位玩家，不會永久消失；但期別與下注紀錄不會自動恢復，還是建議清空後記得補跑 `npx prisma db seed`。

如果只是想清掉「這一期」的下注重新測試，不需要動到整個資料庫，直接用管理後台「下注輸入」頁的**清空本期下注**按鈕即可，不會影響玩家名單或歷史紀錄。

### 其他指令

```bash
npm run test         # 執行單元測試（對獎邏輯）
npm run test:watch   # watch 模式
npx prisma studio    # 開啟資料庫 GUI 檢視/編輯資料
npm run build        # 正式環境打包
```

## 部署到 Cloudflare Tunnel（讓別人從網路上連進來看）

適合「短期活動用」的情境：不用租主機、不用改資料庫，幾分鐘就能拿到一個外部可連的網址，活動結束關掉就沒事、不留痕跡。

### 事前準備

1. **先改管理密碼**：打開 `.env`，把 `ADMIN_PASSWORD` 改成一組別人猜不到的密碼（因為等一下網站會公開在網路上）。改完存檔即可，等一下啟動伺服器時會自動套用。

2. **安裝 cloudflared**（只需要裝一次）：

   ```powershell
   winget install --id Cloudflare.cloudflared -e
   ```

   裝完之後如果在終端機打 `cloudflared` 顯示「找不到指令」，通常是這次的終端機視窗還沒重新讀取新的 PATH，**重開一個新的終端機視窗**再試一次即可。或者直接用完整路徑呼叫：
   `"C:\Program Files (x86)\cloudflared\cloudflared.exe"`

### 每次要開放連線時的步驟

**步驟 1：用正式模式建置並啟動網站**（正式模式比 `npm run dev` 穩定，適合給別人連）

```bash
npm run build
npm start
```

這會在 `http://localhost:3000` 啟動網站，**這個視窗要保持開著**，關掉網站就斷線了。

**步驟 2：另外開一個新的終端機視窗，啟動 Cloudflare Tunnel**

```powershell
cloudflared tunnel --url http://localhost:3000
```

等幾秒後，畫面會印出類似這樣的區塊：

```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
|  https://xxxx-xxxx-xxxx-xxxx.trycloudflare.com                                             |
+--------------------------------------------------------------------------------------------+
```

`https://xxxx-xxxx-xxxx-xxxx.trycloudflare.com` 這個網址就是可以直接分享出去的公開網址，**這個視窗也要保持開著**，關掉隧道就斷線。

**步驟 3：分享網址**

把印出來的網址傳給要看的人，他們打開瀏覽器輸入這個網址，就會看到玩家頁面（`/`）。要進管理後台就在網址後面加 `/admin`，輸入密碼登入。

### 活動結束後怎麼收尾

把步驟 1、步驟 2 開的**兩個終端機視窗都關掉**（或分別按 `Ctrl+C`）即可：

- 關掉 `cloudflared` 那個視窗 → 公開網址立刻失效，不會留下任何雲端資源或費用（沒有註冊帳號，Cloudflare 也不會留存這個網址的任何設定）
- 關掉 `npm start` 那個視窗 → 本機網站停止運行

資料庫（`prisma/dev.db`）還是留在你的電腦上，之後要重新開放只要重複上面「每次要開放連線時的步驟」即可，資料不會不見。

### 進階：換成自己的網域（例如 lotto.你的網域.com）

免費的 quick tunnel 每次啟動網址都會換一個亂數字串，如果想要一個固定、好記的網址（掛在自己的網域下），需要：

1. 你的網域的 DNS 要先掛在 Cloudflare（在 [Cloudflare Dashboard](https://dash.cloudflare.com) 加入網站、把註冊商那邊的 nameserver 改成 Cloudflare 給的兩組，等網域狀態變成 Active）
2. 建立一個「具名 tunnel」而不是 quick tunnel：
   ```powershell
   cloudflared tunnel login          # 會跳出瀏覽器，登入並授權你的 Cloudflare 帳號
   cloudflared tunnel create lotto   # 建立一個叫 lotto 的 tunnel
   cloudflared tunnel route dns lotto lotto.你的網域.com   # 把子網域指到這個 tunnel
   cloudflared tunnel run --url http://localhost:3000 lotto
   ```
3. 之後每次要開放連線，網址就固定是 `https://lotto.你的網域.com`，不會每次都換，一樣要開**兩個終端機視窗**分別執行：

   **視窗 1**：
   ```powershell
   npm start
   ```

   **視窗 2**：
   ```powershell
   cloudflared tunnel run --url http://localhost:3000 lotto
   ```

   ⚠️ 這兩行**不能寫在同一行、同一個終端機**執行，否則 `npm start` 會把後面那串話當成參數吃進去，導致噴出「找不到目錄」之類的錯誤。

這個路徑需要你自己完成第 1 步（DNS 遷移）跟第 2 步的瀏覽器登入授權，這兩步沒辦法由旁人代勞。

## 專案結構

```
prisma/schema.prisma   資料表定義（Player / Draw / Bet / Settings）
prisma/seed.ts          測試資料 seed script
lib/prizeLogic.ts       對獎邏輯（純函式，可獨立單元測試）
lib/drawService.ts      開獎流程（兩階段對獎 + 獎池結算）
lib/queries.ts          共用資料讀取
app/page.tsx             玩家頁面
app/admin/               管理後台各頁面（含 /admin/draws/[id] 單期詳細資料頁）
app/admin/login/         管理後台登入頁
app/api/                 後端 API routes
proxy.ts                 密碼保護（保護 /admin/* 頁面與會修改資料的 API）
tests/prizeLogic.test.ts 對獎邏輯單元測試
```

## 中獎規則與簡化說明

對獎規則比照台灣大樂透玩法：

| 獎項 | 對中方式 | 獎金 |
|---|---|---|
| 頭獎 | 中 6 個號碼 | 均分總獎池（頭獎底金 + 本期所有投注金額），無人中獎則獎池累積到下一期 |
| 貳獎 | 中 5 個號碼 + 特別號 | 固定金額 |
| 參獎 | 中 5 個號碼 | 固定金額 |
| 肆獎 | 中 4 個號碼 | 固定金額 |
| 伍獎 | 中 3 個號碼 | 固定金額 |
| 陸獎 | 中 2 個號碼 + 特別號 | 固定金額 |
| 普獎 | 未中任何號碼但中特別號 | 固定金額 |

貳獎～普獎金額、頭獎底金、每注金額皆為可調整參數（管理後台「參數設定」頁面，或直接改 `Settings` 資料表）。

**簡化規則（未特別要求時採用的合理預設值）：**

1. **頭獎均分餘數捨去**：獎池 ÷ 頭獎得獎人數，無條件捨去到整數，不處理找零。
2. **特別號抽取方式**：先開出 6 個一般號碼（1~選號範圍上限，不重複），特別號固定從剩下的號碼中抽出，因此特別號必定不會與 6 個號碼重複。選號範圍上限可在管理後台「參數設定」調整（預設 20），改變範圍不會影響已經存在的下注紀錄。
3. **期別自動遞進**：每次觸發開獎後，系統會立即自動建立下一期（狀態為「尚未開獎」）供後續下注使用；已開獎的期別無法再新增/編輯/刪除下注。
4. **固定玩家名單**：共 5 位（零小、一小、二小、三小、四小），無新增/刪除玩家功能。
5. **開獎時間**：僅作示意用途，預設為「下注期間開始起算 15 分鐘後」，無實際排程機制（不會自動開獎，仍需管理後台手動觸發）。

## 對獎邏輯測試

對獎判斷（`lib/prizeLogic.ts`）獨立於資料庫與 API 之外，是純函式，方便單元測試：

```bash
npm run test
```

`tests/prizeLogic.test.ts` 涵蓋所有 7 個獎項的邊界情況（含「2 中無特別號」「1 中」等不中獎情境）、號碼順序不影響結果、頭獎金額計算的餘數捨去與除以 0 保護等。
