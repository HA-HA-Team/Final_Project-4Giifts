import { Link } from "react-router-dom";

export const Navbar = () => {

	return (
		<nav className="navbar pers-bg-color">
			<div className="container">
				<Link to="/">
					<span className="navbar-brand mb-0 h1"><img src="public/Logo_solo_4giifts-removebg-preview (1).png" width="10%" height="10%" alt="" /></span>
				</Link>
				<div className="ml-auto d-flex gap-2">
					<Link to="/signup">
						<button className="btn btn-secondary pers-secondary-btn-color border-0">Registrar</button>
					</Link>
					<Link to="/login">
						<button className="btn btn-primary pers-primary-btn-color border-0">Login</button>
					</Link>
				</div>
			</div>
		</nav>
	);
};