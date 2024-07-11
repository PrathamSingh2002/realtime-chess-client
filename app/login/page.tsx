"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { jwtDecode } from "jwt-decode"
import { z } from "zod"
import { base_url } from "../utils/socket"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import axios from "axios"
import { useStore } from "../stores/store"
import { useRouter } from "next/navigation"

const formSchemaLogin = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).max(16,{
    message: "Password must be at most 16 characters."}
  )
})

export default function Login() {
  const { setUser } = useStore()
  const router = useRouter()
  
  const formLogin = useForm<z.infer<typeof formSchemaLogin>>({
    resolver: zodResolver(formSchemaLogin),
    defaultValues: {
      username: '',
      password: ''
    }
  })
 
  async function onSubmitLogin(values: z.infer<typeof formSchemaLogin>) {
    try {
      const response = await axios.post(`${base_url}/api/login`, values);
      if(response.data){
        window.localStorage.setItem('token', JSON.stringify(response.data))
        const obj = jwtDecode(response.data);
        window.localStorage.setItem('user', JSON.stringify(obj))
        console.log(obj)
        router.push('dashboard')
      }
    } catch (error) {
      formLogin.setError('password', { message: "Incorrect credentials" })
    }
  }
 
  return (
    <div className="flex items-start  justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...formLogin}>
            <form onSubmit={formLogin.handleSubmit(onSubmitLogin)} className="space-y-4">
              <FormField
                control={formLogin.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Controller
                        name="username"
                        control={formLogin.control}
                        render={({ field }) => (
                          <Input placeholder="Enter your username" {...field} />
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formLogin.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Controller
                        name="password"
                        control={formLogin.control}
                        render={({ field }) => (
                          <Input type="password" placeholder="Enter your password" {...field} />
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {/* <Link href="/forgot-password" className="text-blue-500 hover:underline">
              Forgot password?
            </Link> */}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            
          </div>
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}