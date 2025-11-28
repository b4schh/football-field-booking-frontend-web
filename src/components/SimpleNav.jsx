// import { Link } from "react-router-dom";
// import { useContext } from "react";
// import { AuthContext } from "../context/AuthContext";

// export default function SimpleNav() {
//   const { user, logout } = useContext(AuthContext);

//   return (
//     <nav className="bg-white border-b">
//       <div className="max-w-6xl mx-auto px-4">
//         <div className="flex items-center justify-between h-16">
//           <div className="flex items-center space-x-4">
//             <Link to="/" className="font-semibold text-lg text-slate-800">FieldBook</Link>
//             <Link to="/admin" className="text-sm text-slate-600 hover:text-slate-800">Admin</Link>
//             <Link to="/owner" className="text-sm text-slate-600 hover:text-slate-800">Owner</Link>
//             <Link to="/customer" className="text-sm text-slate-600 hover:text-slate-800">Customer</Link>
//           </div>
//           <div className="flex items-center gap-4">
//             {user ? (
//               <>
//                 <span className="text-sm text-slate-700">{user.role || "user"}</span>
//                 <button onClick={logout} className="text-sm text-red-600 hover:underline">Logout</button>
//               </>
//             ) : (
//               <Link to="/login" className="text-sm text-blue-600 hover:underline">Login</Link>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }

export default function SimpleNav() {
  return null
}
