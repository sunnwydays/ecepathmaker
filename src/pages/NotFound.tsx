import chillguy from '../assets/chillguy.png';

const NotFound = () => {
    return (
        <div className="my-24 text-xl">
            <h1 className="text-4xl font-bold">404 Not Found</h1>
            <p className="my-4">The page you are looking for does not exist, but maybe you'll find it in your heart.</p>
            <img src={chillguy} alt="Chill Guy" className="w-1/2 mx-auto mt-6" />
        </div>
    )
}

export default NotFound;