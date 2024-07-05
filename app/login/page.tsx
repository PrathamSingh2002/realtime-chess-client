"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import axios from "axios"
import { useStore } from "../stores/store"

const formSchemaLogin = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(8, {
    message: "Username must be at least 8 characters.",
  }).max(16,{
    message: "Username must be at most 16 characters."}
  )
})


export default function Login() {
  const base_url = 'http://localhost:5000';
  const {setUser}  = useStore()  
  // 1. Define your form.
  const formLogin = useForm<z.infer<typeof formSchemaLogin>>({
    resolver: zodResolver(formSchemaLogin),
  })
 
  // 2. Define a submit handler.
  async function onSubmitLogin(values: z.infer<typeof formSchemaLogin>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const data = {
      username:values.username,
      password:values.password
    }
    try {
        const response = await axios.post(`${base_url}/api/login`, data );
        if(response){
          window.localStorage.setItem('user',JSON.stringify(response.data))
          setUser(response.data)
        }
        // Handle success (redirect, show success message, etc.)

    } catch (error) {
        formLogin.setError('password',{message:"Incorrect credentials"})
        // Handle error (show error message, retry logic, etc.)
    }
  }
 
  return (
    <div className="p-11 m-auto max-w-lg">
        <Form {...formLogin}>
          <form onSubmit={formLogin.handleSubmit(onSubmitLogin)} className="space-y-8">
            <FormField
              control={formLogin.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  {formLogin.formState.errors.username && (
                    <FormMessage>
                      {formLogin.formState.errors.username.message}
                    </FormMessage>
                  )}
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
                    <Input type="password" placeholder="shadcn" {...field} />
                  </FormControl>
                  {formLogin.formState.errors.password && (
                    <FormMessage>
                      {formLogin.formState.errors.password.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded">Submit</Button>
            <Button className="w-full bg-gray-500 text-white py-2 px-4 rounded mt-4" >Signup</Button>
          </form>
        </Form> 
      </div>

  )
}
