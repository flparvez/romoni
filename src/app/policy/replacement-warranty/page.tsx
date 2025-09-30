import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Replacement Warranty | A1 Romoni ',
  description: 'A1 Romoni Replacement Warranty Policy',
}
const ReplacementPolicy = () => {
  return (
    <div className="bg-gray-100 p-2 mt-4 rounded-lg shadow-md">
      <h1 className="text-xl font-bold mb-4">A1 Romoni Replacement Warranty Policy</h1>
      <p className="mb-4">
        আমরা A1 Romoni-এ সবসময় অরিজিনাল এবং অথেনটিক প্রোডাক্ট বিক্রয় করি। আমাদের বেশিরভাগ প্রোডাক্টই ব্র্যান্ড ওয়ারেন্টি সহ আসে, কিছু কিছু প্রোডাক্ট থাকে ওয়ারেন্টি ছাড়া। যেসব প্রোডাক্টে ওয়ারেন্টি থাকে, সেগুলো ওয়েবসাইটে উল্লেখ থাকে। আবার ক্ষেত্র বিশেষে, প্রোডাক্টের সাথে ওয়ারেন্টি কার্ডও থাকে। যেকোন প্রোডাক্টের রিপ্লেসমেন্ট ওয়ারেন্টি পিরিয়ডে সর্বোচ্চ একবার প্রোডাক্টটি রিপ্লেস করা হয়, পরবর্তীতে সমস্যা হলে এবং ওয়ারেন্টি থাকলে সেটা সার্ভিস ওয়ারেন্টিতে থাকে। সুতরাং, একবারের বেশি আমরা কোন প্রোডাক্টই রিপ্লেস করতে পারি না।
      </p>
      <h2 className="text-xl font-semibold mb-2">যে যে ক্ষেত্রে রিপ্লেসমেন্ট পাবেন:</h2>
      <ul className="list-disc list-inside mb-4">
        <li>ম্যানুফ্যাকচারিং ত্রুটি।</li>
        <li>অপারেটিং সিস্টেম সম্পর্কিত সমস্যা কিন্তু কোনো এপস সম্পর্কিত না।</li>
        <li>ডিভাইস সমস্যার কারণে যদি পাওয়ার না আসে। (এক্সেসরিজের জন্য ওয়ারেন্টি নেই যেমন- রিমোট, কিবোর্ড, ব্যাটারি, লাইট ইত্যাদি)</li>
        <li>যদি ৬০% পারফরমেন্সে ও প্রোডাক্ট জাস্ট রিস্টার্ট নেয় বা কাজ না করে।</li>
      </ul>
      <p className="mb-4">
        সাধারণত, যেসব প্রোডাক্টে রিপ্লেসমেন্ট ওয়ারেন্টি থাকে, সেগুলোতে প্রবলেম পেলে রিপ্লেস করা হয়, রিপ্লেসমেন্টের ক্রাইটেরিয়া মিট করলে। কিন্তু এরপরও অনেক কারণ থাকে, যার জন্য প্রোডাক্ট রিপ্লেসমেন্টের আওতায় থাকে না। নিম্নে এমন কিছু কারণ রেফারেন্স হিসেবে দেয়া হলো:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>প্রোডাক্টটি যদি ফিজিক্যালি ড্যামেজ হয় বা ভেঙ্গে যায়।</li>
        <li>যদি পুড়ে যায় বা এমন কিছু হয়।</li>
        <li>যদি প্রোডাক্টের অরিজিনাল ওয়ারেন্টি স্টিকার বা সফটওয়ার না থাকে।</li>
        <li>যদি প্রোডাক্টটি অস্বাভাবিকভাবে ব্যবহার করা হয় বা এমন কোনো পরিবেশে ব্যবহার করা হয়, যেখানে ব্যবহার করা উচিত না।</li>
        <li>পূর্বে রিপ্লেস করে দেয়া হয়েছে এমন প্রোডাক্টের ক্ষেত্রে পরবর্তীতে আর ওয়ারেন্টি প্রযোজ্য হবে না।</li>
      </ul>
      <p className="mb-4">
        যদি আমাদের কাছে রিপ্লেসমেন্টের জন্য পর্যাপ্ত প্রোডাক্ট না থাকে, তাহলে রিপ্লেসমেন্ট পেতে একটু বেশি সময় লাগতে পারে। যদি প্রোডাক্টটি কোনভাবেই না দেয়া যায় এবং ভবিষ্যতে পাওয়ার সুযোগও না থাকে, তাহলে আমরা এর পরিবর্তে সার্ভিস ওয়ারেন্টি দিতে পারি।
      </p>
      <p className="mb-4">
        প্রোডাক্ট কিংবা প্রোডাক্ট ক্রয় সম্পর্কিত আপনার যদি অন্য কোনো সমস্যা থাকে, তাহলে আমাদের রিটার্ন পলিসি কিংবা টার্মস এন্ড কন্ডিশন গুলো আপনাকে হয়তোবা সহযোগিতা করবে।
      </p>
      <h2 className="text-xl font-semibold mb-2">Replacement Warranty Policy</h2>
      <p className="mb-4">
        We at A1 Romoni are offering all Genuine Products. Many of the products come with brand warranty and some don&apos;t. If there is any warranty for any particular product, it shall be clearly written on the website or on the invoice, or there may have a separate warranty card for the different time periods. Please bear in mind that the Replacement warranty will be only available once for a particular product and during the period if the product got the same or other issues from the second incident it will cover as a service warranty. In a simple way - The replacement warranty is valid at one time only. We are unable to replace it more than one time.
      </p>
      <h2 className="text-xl font-semibold mb-2">Here is the simple and easy way to get a replacement, if there is an issue such as:</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Manufacturing fault</li>
        <li>OS related fault but NOT for any Apps</li>
        <li>If there is no power due to a device issue (No warranty for any kinds of accessories such as Remote, Keyboard, Light, Battery Etc.)</li>
        <li>If the product is restarting or not running even at 60% of its performance</li>
      </ul>
      <p className="mb-4">
        In general, if there is any product sold with a Replacement warranty, it means you will get a new product after inspection and if it qualifies. There are many reasons, it may get rejected or not eligible to get a replacement. Here are a few reasons for your kind reference:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>If there is any physical damage</li>
        <li>If there is any burn or similar</li>
        <li>If the product is not with the original software or warranty void stickers</li>
        <li>If the product is used abnormally or in such an environment it is not supposed to be</li>
        <li>If any item replaced once, there won&apos;t be any warranty for the replaced items</li>
      </ul>
      <p className="mb-4">
        If there is such an environment that we don&apos;t have enough product to give a quick replacement, it may take a little longer time to get the product as a replacement. If we don&apos;t get the product and if there is no chance to get it in the near future, we may offer a service warranty instead.
      </p>
      <p className="mb-4">
        Further Reads: If you have other issues with your product or purchase, please read our detailed Return Policy for other terms and conditions which may help you better.
      </p>
    </div>
  )
}

export default ReplacementPolicy
