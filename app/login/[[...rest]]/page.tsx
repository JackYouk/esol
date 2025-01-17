import { SignIn } from "@clerk/nextjs";

export default function Login() {
    return(
        <div className="w-full h-screen flex items-center justify-center">
            <SignIn 
                path="/login" 
            />
        </div>
    )
}