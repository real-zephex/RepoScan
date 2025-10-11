import ImportRepo from "./importRepo";

const Navbar = async () => {
  return (
    <nav className="w-full flex flex-row items-center justify-between p-4 border-b-2 border-gray-200">
      <h2 className="font-semibold text-xl md:text-2xl">DocWriter</h2>

      <div className="flex flex-row items-center gap-4">
        <button className="flex flex-row items-center gap-2 border border-gray-300 px-3 py-1 rounded hover:bg-gray-100 hover:shadow-xl active:scale-95 transition-all hover:cursor-pointer">
          <span>Github</span>
        </button>
        <ImportRepo />
      </div>
    </nav>
  );
};

export default Navbar;
