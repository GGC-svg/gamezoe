import React from 'react';
import { Mail, Shield, Smartphone } from 'lucide-react';
import { APP_NAME, SUPPORT_EMAIL } from '../constants';

interface FooterProps {
  onNavigate: (view: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-nexus-800 border-t border-slate-700 text-slate-400 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="text-white font-bold text-lg mb-4">{APP_NAME}</h4>
            <p className="text-sm mb-4">
              頂級網頁遊戲的首選目的地。
              隨時隨地，在任何設備上即刻遊玩。
            </p>
            <div className="flex gap-4">
              {/* Social placeholders */}
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-nexus-accent cursor-pointer transition-colors">
                <span className="font-bold text-white text-xs">Fb</span>
              </div>
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-nexus-accent cursor-pointer transition-colors">
                <span className="font-bold text-white text-xs">X</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-4">支援服務</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-nexus-accent transition-colors text-left">
                  回到首頁
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms')} className="hover:text-nexus-accent transition-colors text-left">
                  服務條款
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-nexus-accent transition-colors text-left">
                  隱私權政策
                </button>
              </li>
              <li><button className="hover:text-nexus-accent transition-colors text-left cursor-not-allowed opacity-50">Cookie 設定</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-4">聯絡我們</h4>
            <div className="flex items-center gap-2 text-sm mb-2">
              <Mail className="h-4 w-4 text-nexus-accent" />
              <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-white transition-colors">{SUPPORT_EMAIL}</a>
            </div>
            <div className="flex items-center gap-2 text-sm mb-2">
              <Shield className="h-4 w-4 text-nexus-accent" />
              <span>KIWI 安全支付保障</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Smartphone className="h-4 w-4 text-nexus-accent" />
              <span>行動裝置最佳化</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-6 flex flex-col md:flex-row justify-between items-center text-xs">
          <div className="flex flex-col md:flex-row gap-1 text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} 平騵科技股份有限公司 (Pingyuan Technology Co., Ltd.) 版權所有。</p>
          </div>
          <p className="mt-2 md:mt-0">Built with React & Tailwind</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;