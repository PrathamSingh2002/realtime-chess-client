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
        <div className="flex items-start justify-center min-h-screen bg-gray-100">
          <Card className="w-[400px]">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
              <CardDescription className="text-center">
                Enter your details to sign up for a new account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...formSignup}>
                <form onSubmit={formSignup.handleSubmit(onSubmitSignup)} className="space-y-4">
                  <FormField
                    control={formSignup.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Controller
                            name="name"
                            control={formSignup.control}
                            render={({ field }) => (
                              <Input placeholder="Enter your full name" {...field} />
                            )}
                          />
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
                          <Controller
                            name="username"
                            control={formSignup.control}
                            render={({ field }) => (
                              <Input placeholder="Choose a username" {...field} />
                            )}
                          />
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
                          <Controller
                            name="password"
                            control={formSignup.control}
                            render={({ field }) => (
                              <Input type="password" placeholder="Create a strong password" {...field} />
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">Sign Up</Button>
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
                <Link href="/login" className="text-blue-500 hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
    )
}

export default Signup;