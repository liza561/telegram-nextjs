import { query , mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserByClerkUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    if (!userId) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))

      .first();
  },
});
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const upsertUser = mutation({
  args: { 
userId: v.string(),
name: v.string(),
email: v.string(),
imageURL: v.string(),
   },
  handler: async (ctx, { userId, name, email, imageURL }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (existingUser) {
      await ctx.db.patch(existingUser._id,{name,imageURL});
      return existingUser._id;
    }
      return await ctx.db.insert("users", {userId, name,email,imageURL});
  },
});
//search user by email
export const searchUsers= query({
  args: { searchTerm: v.string() },
    handler: async (ctx, { searchTerm }) => {
    if (!searchTerm.trim()) return [];
    const normalizedSearch = searchTerm.toLowerCase().trim();
    const allUsers = await ctx.db .query("users").collect();
    return allUsers.filter(user=>
      user.name.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch)
    ).slice(0,20); //limit to 20 results
  },
});