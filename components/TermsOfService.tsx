import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { APP_NAME } from '../constants';

const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in text-slate-300">
      <div className="bg-slate-800/50 rounded-3xl p-8 md:p-12 border border-slate-700 shadow-xl">
        <div className="flex items-center gap-4 mb-8 border-b border-slate-700 pb-6">
          <ShieldAlert className="h-10 w-10 text-nexus-accent" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">服務條款 (Terms of Service)</h1>
        </div>

        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. 同意條款</h2>
            <p>
              歡迎使用由平騵科技股份有限公司（以下簡稱「本公司」）所營運之 {APP_NAME} 遊戲平台（以下簡稱「本服務」）。
              當您開始使用本服務時，即表示您已閱讀、瞭解並同意接受本服務條款之所有內容。若您為未成年人，應於您的家長（或監護人）閱讀、瞭解並同意本約定書之所有內容後，方得使用本服務。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. 會員註冊與帳號安全</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>您同意於註冊時提供正確、最新及完整的個人資料。</li>
              <li>您有義務妥善保管您的帳號與密碼，並不得將帳號出借、轉讓或與他人共用。</li>
              <li>若發現帳號遭盜用或有任何安全疑慮，應立即通知本公司。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. 虛擬貨幣與付費內容</h2>
            <p className="mb-2">
              本平台部分遊戲或功能需以付費方式取得（包括但不限於購買遊戲本體、虛擬道具或訂閱服務）。
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>所有付費交易皆透過第三方支付金流（如 Stripe, LINE Pay 等）進行，本公司不直接儲存您的信用卡完整資訊。</li>
              <li>除法律另有規定外，所有數位內容一經購買並交付（即開通遊玩權限）後，即視為已履行完畢，不接受退費。</li>
              <li>您在遊戲中取得的虛擬貨幣或寶物，僅擁有使用權，所有權仍歸屬於本公司或遊戲開發商。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. 使用者行為規範</h2>
            <p>您同意不進行以下行為，否則本公司有權暫停或終止您的帳號：</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>使用外掛程式、加速器、腳本或其他非官方允許之方式干擾遊戲公平性。</li>
              <li>發布攻擊性、猥褻、暴力、政治敏感或違反公共秩序善良風俗之言論。</li>
              <li>利用本服務進行任何商業行為或未經授權的廣告宣傳。</li>
              <li>惡意攻擊、入侵本平台伺服器或試圖獲取非公開數據。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. 智慧財產權</h2>
            <p>
              本平台上之所有內容，包括但不限於遊戲軟體、美術素材、商標、文字描述，均由本公司或原授權開發商擁有智慧財產權。
              未經事前書面同意，您不得逕自重製、改作、散布或公開傳輸。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">6. 免責聲明</h2>
            <p>
              本服務依「現狀」提供，本公司不保證服務絕對無誤、不中斷或完全安全。對於因網路中斷、駭客攻擊、不可抗力因素導致的資料遺失或遊戲回溯，本公司將盡力協助恢復，但僅在法律允許範圍內負賠償責任。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">7. 準據法與管轄法院</h2>
            <p>
              本條款之解釋與適用，均應依照中華民國法律。因本條款所生之爭議，雙方同意以臺灣臺北地方法院為第一審管轄法院。
            </p>
          </section>
          
          <div className="pt-8 border-t border-slate-700 text-sm text-slate-500">
             最後更新日期：2025年01月01日
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;