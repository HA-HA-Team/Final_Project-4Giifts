import React from "react";
import "./Footer.css";

export const Footer = () => {

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<footer className="footer-wrapper">
			<div className="footer-content container">

				{/* Izquierda */}
				<div className="footer-left">
					<p>© 2025 4Giifts — Todos los derechos reservados</p>
				</div>

				{/* Centro */}
				<div className="footer-center">
					<p>
						¿Necesitas ayuda? Contáctanos:{" "}
						<a href="mailto:4giifts@gmail.com">4giifts@gmail.com</a>
					</p>
				</div>

				{/* Derecha */}
				<div className="footer-right">
					<button onClick={scrollToTop} className="btn-top">
						↑ Volver al inicio
					</button>
				</div>

			</div>
		</footer>
	);
};
