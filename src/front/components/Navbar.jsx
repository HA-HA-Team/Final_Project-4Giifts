import { Link } from "react-router-dom";

export const Navbar = () => {

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container">
				<Link to="/">
					<span className="navbar-brand mb-0 h1">Inicio</span>
				</Link>
				<div className="ml-auto d-flex gap-2">
					<Link to="/login">
						<button className="btn btn-primary">Login</button>
					</Link>
					<Link to="/signup">
						<button className="btn btn-secondary">Signup</button>
					</Link>
				</div>
			</div>
		</nav>
	);
};