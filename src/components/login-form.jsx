import { GalleryVerticalEnd } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({
  className,
  onSignupClick,
  onLoginClick,
  mode = 'login',
  onSubmit,
  loading,
  error,
  success,
  form, // { name, email, phone, password, setName, setEmail, setPhone, setPassword, emailError, setEmailError }
  onVerifyEmail,
  isVerifying,
  isEmailVerified,
  verifyMessage,
  ...props
}) {
  // Email validation for signup
  const validateEmail = (email) => {
    return /@(gmail\.com|mite\.ac\.in)$/i.test(email);
  };

  const handleEmailChange = (e) => {
    form?.setEmail(e.target.value);
    if (mode === 'signup') {
      if (!validateEmail(e.target.value)) {
        form?.setEmailError && form.setEmailError('Only gmail.com or mite.ac.in emails are allowed');
      } else {
        form?.setEmailError && form.setEmailError('');
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2">
            <a href="#" className="flex flex-col items-center gap-1 font-medium">
              <div className="flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-5" />
              </div>
              <span className="sr-only">MiteEat.</span>
            </a>
            <h1 className="text-lg font-bold text-black">
              {mode === 'signup' ? 'Create your Canteen Account' : 'Welcome to MiteEat.'}
            </h1>
            <div className="text-center text-xs text-gray-600">
              {mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <span className="underline underline-offset-4 cursor-pointer text-black font-semibold" onClick={onLoginClick}>
                    Login
                  </span>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <span className="underline underline-offset-4 cursor-pointer text-black font-semibold" onClick={onSignupClick}>
                    Sign up
                  </span>
                </>
              )}
            </div>
          </div>
          {mode === 'signup' && (
            <>
              <div className="text-center text-sm text-gray-700 font-medium mb-1">
                Join the CollegeCanteen family and unlock exclusive food experiences!
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-black">Name</Label>
                <Input id="name" type="text" placeholder="Your Name" value={form?.name} onChange={e => form?.setName(e.target.value)} required className="bg-white border-gray-300 text-black text-sm h-9" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-black">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="9876543210" value={form?.phone} onChange={e => form?.setPhone(e.target.value)} required className="bg-white border-gray-300 text-black text-sm h-9" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-black">Password</Label>
                <Input id="password" type="password" placeholder="Create a password" value={form?.password} onChange={e => form?.setPassword(e.target.value)} required className="bg-white border-gray-300 text-black text-sm h-9" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-black">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="Confirm your password" value={form?.confirmPassword} onChange={e => form?.setConfirmPassword(e.target.value)} required className="bg-white border-gray-300 text-black text-sm h-9" />
                {form?.password && form?.confirmPassword && form?.password !== form?.confirmPassword && (
                  <span className="text-xs text-red-500 mt-0.5">Passwords do not match</span>
                )}
              </div>
            </>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-black">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" value={form?.email} onChange={handleEmailChange} required className="bg-white border-gray-300 text-black text-sm h-9" />
            {mode === 'signup' && form?.emailError && (
              <span className="text-xs text-red-500 mt-0.5">{form.emailError}</span>
            )}
          </div>
          {mode === 'login' && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-black">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" value={form?.password} onChange={e => form?.setPassword(e.target.value)} required className="bg-white border-gray-300 text-black text-sm h-9" />
            </div>
          )}
          <Button type="submit" className="w-full bg-black text-white font-semibold text-sm shadow-sm hover:bg-gray-800 transition-all h-9" disabled={loading || (mode === 'signup' && (!!form?.emailError || !form?.password || !form?.confirmPassword || form?.password !== form?.confirmPassword))}>
            {loading ? (mode === 'signup' ? 'Signing up...' : 'Logging in...') : (mode === 'signup' ? 'Sign Up' : 'Login')}
          </Button>
          {error && <p className="text-red-500 text-center text-xs mt-1">{error}</p>}
          {success && <p className="text-green-600 text-center text-xs mt-1">{success}</p>}
        </div>
      </form>
      {mode === 'login' && (
        <>
          <div className="flex items-center my-3">
            <hr className="flex-grow border-gray-200" />
            <span className="mx-3 text-xs text-gray-400">Or</span>
            <hr className="flex-grow border-gray-200" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" type="button" className="w-full h-9 text-xs border-gray-300 hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" fill="currentColor" />
              </svg>
              Continue with Apple
            </Button>
            <Button variant="outline" type="button" className="w-full h-9 text-xs border-gray-300 hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
              </svg>
              Continue with Google
            </Button>
          </div>
          <div className="text-center text-xs text-gray-500 mt-3">
            By clicking continue, you agree to our <a href="#" className="underline text-black">Terms of Service</a> and <a href="#" className="underline text-black">Privacy Policy</a>.
          </div>
        </>
      )}
    </div>
  );
}
