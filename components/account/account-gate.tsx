"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { ShellSkeleton } from "@/components/ui/page-skeletons"

import { ProfileLayout } from "@/components/account/profile-layout"
import {
  setAuthInitialized,
  setAuthUser,
  clearAuthState,
} from "@/features/auth/auth-slice"
import { useMe } from "@/features/auth/hooks"
import { useAppDispatch } from "@/lib/store/store"

/** Everything under /account needs a signed-in customer; guests go to the login page. */
export function AccountGate({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const meQuery = useMe()
  const me = meQuery.data

  React.useEffect(() => {
    if (me) {
      dispatch(setAuthUser(me))
      dispatch(setAuthInitialized(true))
    } else if (meQuery.isError) {
      dispatch(clearAuthState())
      router.replace(`/?auth=login&next=${encodeURIComponent(pathname)}`)
    }
  }, [dispatch, me, meQuery.isError, pathname, router])

  if (!me) return <ShellSkeleton variant="site" label="Loading your account" />

  return <ProfileLayout>{children}</ProfileLayout>
}
