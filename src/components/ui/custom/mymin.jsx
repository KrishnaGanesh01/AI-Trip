import Mytrips from '@/mytrips'; // if not already imported

const NoUser = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        return (
            <div className="text-center mt-10">
                <h1 className="font-extrabold text-[45px]">
                    <span className="text-[#FF7A1A] block">
                        Click on Get Started to View Your Trips
                    </span>
                </h1>
            </div>
        );
    } else {
        return <Mytrips />;
    }
};

export default NoUser;