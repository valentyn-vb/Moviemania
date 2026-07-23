import { logOut } from '@/lib/auth/logoutAction';
import Link from 'next/link';
import { IoLogInOutline, IoLogOutOutline } from 'react-icons/io5';

const linkClass =
  'flex items-center gap-4 pl-8 pr-6 no-underline transition-colors duration-300 mb-6 pc:mb-0 pc:py-6 pc:w-[98%] pc:text-l [&_svg]:w-10 [&_path]:stroke-current';
const inactiveClass = 'text-muted hover:text-accent';

export default function AccountControl({
  user,
}: {
  user: { id: string; email: string } | null;
}) {
  if (!user) {
    return (
      <Link href="/sign-in" className={`${linkClass} ${inactiveClass}`}>
        <span>Sign in</span>
        <IoLogInOutline />
      </Link>
    );
  }

  return (
    <div className="pc:w-[98%]">
      <p
        className="mb-2 truncate pl-8 pr-6 pl-6 text-s font-normal text-muted"
        title={user.email}
      >
        {user.email}
      </p>
      <form action={logOut}>
        <button
          type="submit"
          className={`${linkClass} ${inactiveClass} w-full cursor-pointer border-none bg-transparent p-0 text-left`}
        >
          <span>Sign out</span>
          <IoLogOutOutline />
        </button>
      </form>
    </div>
  );
}
