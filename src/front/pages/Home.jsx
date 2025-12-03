import React, { useEffect } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Jumbotron } from "../components/Jumbotron.jsx";
import Card from "../components/Card.jsx";
import { Instrucciones } from "../components/Instrucciones.jsx";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";

const imageUrl1 = "src/front/assets/img/regalo.jpg";
const button = "¡Ver producto!";


export const Home = () => {

	const { store, dispatch } = useGlobalReducer()

	const loadMessage = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL

			if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file")

			const response = await fetch(backendUrl + "/api/hello")
			const data = await response.json()

			if (response.ok) dispatch({ type: "set_hello", payload: data.message })

			return data

		} catch (error) {
			if (error.message) throw new Error(
				`Could not fetch the message from the backend.
				Please check if the backend is running and the backend port is public.`
			);
		}

	}

	useEffect(() => {
		loadMessage()
	}, [])

	return (
		<div>

			<Jumbotron />

			<Instrucciones />

			<Swiper
				modules={[Autoplay]}
				autoplay={{ delay: 2000, disableOnInteraction: false }}
				spaceBetween={20}
				slidesPerView={1}
				loop={true}
				breakpoints={{
					768: { slidesPerView: 2 },
					1024: { slidesPerView: 3 }
				}}
				className="mySwiper"
			>

				<div className='ms-5 me-5 mb-5 d-flex row gap-4 justify-content-center'>

					<h3 className="d-flex justify-content-center fw-bold mt-4">Otros usuarios han seleccionado estos regalos como favorito...</h3>
					<SwiperSlide>
					<Card
						imageUrl={imageUrl1}
						title="Título imagen"
						description="is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"
						button={button} />
					</SwiperSlide>

					<SwiperSlide>
					<Card
						imageUrl={imageUrl1}
						title="Título imagen"
						description="is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"
						button={button} />
					</SwiperSlide>

					<SwiperSlide>
					<Card
						imageUrl={imageUrl1}
						title="Título imagen"
						description="is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"
						button={button} />
					</SwiperSlide>

					<SwiperSlide>
					<Card
						imageUrl={imageUrl1}
						title="Título imagen"
						description="is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"
						button={button} />
					</SwiperSlide>


				</div>

			</Swiper>
		</div>




	);
}; 