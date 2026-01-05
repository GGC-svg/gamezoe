import React from 'react';
import { LockKeyhole } from 'lucide-react';
import { APP_NAME, SUPPORT_EMAIL } from '../constants';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in text-slate-300">
      <div className="bg-slate-800/50 rounded-3xl p-8 md:p-12 border border-slate-700 shadow-xl">
        <div className="flex items-center gap-4 mb-8 border-b border-slate-700 pb-6">
          <LockKeyhole className="h-10 w-10 text-nexus-accent" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">隱私權政策 (Privacy Policy)</h1>
        </div>

        <div className="space-y-8 leading-relaxed">
          <section>
            <p>
              平騵科技股份有限公司（以下簡稱「我們」）非常重視您的隱私權。本隱私權政策將說明 {APP_NAME} 如何蒐集、處理及利用您的個人資料。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. 我們蒐集的資料</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>帳戶資訊：</strong>當您使用 Google 或 Facebook 登入時，我們會蒐集您的 Email、姓名及大頭貼照。</li>
              <li><strong>交易資訊：</strong>當您購買付費遊戲時，我們會記錄交易時間、金額及購買項目（但不儲存您的完整信用卡號）。</li>
              <li><strong>使用數據：</strong>包括您的遊戲遊玩時間、成就進度、點擊紀錄及裝置資訊（如 IP 位址、瀏覽器類型）。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. 資料使用目的</h2>
            <p>我們蒐集您的資料主要用於：</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>驗證您的身份並提供會員專屬服務。</li>
              <li>處理您的訂單與發票事宜。</li>
              <li>分析使用者行為以改善遊戲體驗與平台效能。</li>
              <li>寄送系統通知、遊戲更新資訊或行銷活動（您可以隨時取消訂閱）。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. 資料分享與揭露</h2>
            <p>
              我們絕不會將您的個人資料販售給第三方。僅在以下情況下，我們可能會分享您的資訊：
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>服務供應商：</strong>如雲端主機服務、金流支付業者（Stripe, PayPal），僅限於執行服務必要之範圍。</li>
              <li><strong>法律要求：</strong>若配合司法單位調查或依法律規定需提供時。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Cookie 技術的使用</h2>
            <p>
              本網站使用 Cookie 以提供登入狀態維持、購物車記憶及個人化推薦功能。若您關閉瀏覽器的 Cookie 功能，可能會導致部分服務無法正常運作。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. 資料安全</h2>
            <p>
              我們採用符合業界標準的 SSL 加密技術傳輸您的資料，並設置防火牆與權限控管機制，防止未經授權的存取。然而，網際網路傳輸無法保證 100% 安全，請您亦需妥善保管您的帳號密碼。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">6. 您對資料的權利</h2>
            <p>
              依據個人資料保護法，您可以聯繫我們行使以下權利：
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>查詢或請求閱覽您的個人資料。</li>
              <li>請求製給複製本。</li>
              <li>請求補充或更正。</li>
              <li>請求停止蒐集、處理或利用。</li>
              <li>請求刪除您的帳號與資料（請注意，刪除後您將無法恢復購買過的遊戲權限）。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">7. 聯絡我們</h2>
            <p>
              若您對本隱私權政策有任何疑問，或欲行使上述權利，請透過以下方式聯繫我們的資料保護官：
            </p>
            <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
              <p className="font-bold text-white">平騵科技股份有限公司</p>
              <p>Email: <a href={`mailto:${SUPPORT_EMAIL}`} className="text-nexus-accent hover:underline">{SUPPORT_EMAIL}</a></p>
            </div>
          </section>
          
           <div className="pt-8 border-t border-slate-700 text-sm text-slate-500">
             最後更新日期：2025年01月01日
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;