'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import axios from 'axios'
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
const formSchemaSignup = z.object({
    name: z.string().min(3, {
      message: "Enter a valid name.",
    }),
    username: z.string().min(2, {
      message: "Username must be at least 2 characters.",
    }),
    password: z.string().min(8, {
      message: "Username must be at least 8 characters.",
    }).max(16,{
      message: "Username must be at most 16 characters."}
    )
  })
import { base_url } from "../utils/socket"
export default function Signup(){
    const formSignup = useForm<z.infer<typeof formSchemaSignup>>({
        resolver: zodResolver(formSchemaSignup),
      })
     
      // 2. Define a submit handler.
      async function onSubmitSignup(values: z.infer<typeof formSchemaSignup>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        const data = {
          name:values.name,
          username:values.username,
          password:values.password
        }
        try {
            const response = await axios.post(`${base_url}/api/signup`, data );
            console.log('Signup successful');
            // Handle success (redirect, show success message, etc.)

        } catch (error) {
            formSignup.setError('username',{message:"User already exist"})
            // Handle error (show error message, retry logic, etc.)
        }
      }
    
    return(
        <div className="p-11 m-auto max-w-lg">
            <Form {...formSignup}>
            <form onSubmit={formSignup.handleSubmit(onSubmitSignup)} className="space-y-8">
            <FormField
                control={formSignup.control}
                name="name"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                    <Input placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormDescription>
                    This is your public display name.
                    </FormDescription>
                    {formSignup.formState.errors.name && (
                    <FormMessage>
                        {formSignup.formState.errors.name.message}
                    </FormMessage>
                    )}
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
                    <Input placeholder="shadcn" {...field} />
                    </FormControl>
                    {formSignup.formState.errors.username && (
                    <FormMessage>
                        {formSignup.formState.errors.username.message}
                    </FormMessage>
                    )}
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
                    <Input type="password" placeholder="shadcn" {...field} />
                    </FormControl>
                    {formSignup.formState.errors.password && (
                    <FormMessage>
                        {formSignup.formState.errors.password.message}
                    </FormMessage>
                    )}
                </FormItem>
                )}
            />
            <Button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded">Submit</Button>
            <Button className="w-full bg-gray-500 text-white py-2 px-4 rounded mt-4" >Login</Button>
            </form>
        </Form>
    </div>
    )
    
}