/** 页脚 */
export default function Footer() {
  return (
    <footer className="mt-20 border-t border-neutral-800/60 pt-8 pb-12 flex flex-col md:flex-row items-center justify-between text-neutral-500 text-sm gap-4">
      <p>© {new Date().getFullYear()} 三角洲行动助手. 工具仅供游戏交流使用。</p>
      <div className="flex gap-4">
        <a href="#" className="hover:text-emerald-400 transition-colors">
          隐私政策
        </a>
        <a href="#" className="hover:text-emerald-400 transition-colors">
          用户协议
        </a>
        <a href="#" className="hover:text-emerald-400 transition-colors">
          联系反馈
        </a>
      </div>
    </footer>
  );
}
