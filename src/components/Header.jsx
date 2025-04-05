function Header() {
    return (
        <div className="bg-white flex mb-10">
            <img
                src="https://smvdu.ac.in/wp-content/uploads/2023/08/cropped-logo-600-1.png"
                alt="Login Illustration"
                className="w-20 h-20 object-cover rounded-r-2xl ml-4 mt-2"
            />
            <div className="flex flex-col justify-center items-start mt-3 ml-4">
                <div className="text-black text-4xl font-bold">
                    Shri Mata Vaishno Devi University
                </div>
            </div>
        </div>
    )
}

export default Header;