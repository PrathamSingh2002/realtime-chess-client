'use client'

import { useStore } from "../stores/store"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { z } from 'zod';
import axios from 'axios'
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
import { base_url } from "../utils/socket"
import { useRouter } from 'next/navigation'
import { FaChess } from 'react-icons/fa'

const formSchemaSignup = z.object({
    name: z.string().min(3, {
      message: "Enter a valid name.",
    }),
    username: z.string().min(2, {
      message: "Username must be at least 2 characters.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }).max(16,{
      message: "Password must be at most 16 characters."}
    )
  })

function Signup(){
    const {setUser} = useStore()
    const router = useRouter()

    const formSignup = useForm<z.infer<typeof formSchemaSignup>>({
      resolver: zodResolver(formSchemaSignup),
      defaultValues: {
        name: '',
        username: '',
        password: ''
      }
    })
     
    async function onSubmitSignup(values: z.infer<typeof formSchemaSignup>) {
      try {
          const response = await axios.post(`${base_url}/api/signup`, values);
          if(response && response.data){
            window.localStorage.setItem('token', JSON.stringify(response.data))
            const obj = JSON.parse(atob(response.data.split('.')[1]));
            window.localStorage.setItem('user', JSON.stringify(obj));
            setUser(obj);
            router.push('/dashboard');
          }
      } catch (error) {
          formSignup.setError('username', {message: "User already exists"})
      }
    }
    
    return(
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <FaChess className="text-5xl text-indigo-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-center">Create an account</CardTitle>
              <CardDescription className="text-center text-lg">
                Join Chesslive and start playing today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...formSignup}>
                <form onSubmit={formSignup.handleSubmit(onSubmitSignup)} className="space-y-6">
                  <FormField
                    control={formSignup.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} className="bg-gray-50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formSignup.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a username" {...field} className="bg-gray-50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formSignup.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create a strong password" {...field} className="bg-gray-50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Sign Up</Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
              </div>
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-indigo-600 hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
    )
}

export default Signup;