
import './Flor.css'

const Flor = () => {
    return (
        <div className="loader">
            <div className="stick"></div>

            <div className="container">
                <div className="pin"></div>

                <div className="paper-container red">
                    <div className="paper-leaf-1 red-1"></div>
                    <div className="paper-leaf-2 red-2"></div>
                </div>

                <div className="paper-container rotate-90">
                    <div className="paper-leaf-1 yellow-1"></div>
                    <div className="paper-leaf-2 yellow-2"></div>
                </div>

                <div className="paper-container rotate-180">
                    <div className="paper-leaf-1 green-1"></div>
                    <div className="paper-leaf-2 green-2"></div>
                </div>

                <div className="paper-container rotate-270">
                    <div className="paper-leaf-1 blue-1"></div>
                    <div className="paper-leaf-2 blue-2"></div>
                </div>
            </div>

            <div className="line"></div>
        </div>
    );
}

export default Flor;