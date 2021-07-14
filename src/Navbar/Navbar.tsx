import React from 'react';
import NavbarBody from './NavbarBody';
import NavbarHeader from './NavbarHeader';
import NavbarBrand from './NavbarBrand';
import { useClassNames } from '../utils';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';

export const NavbarContext = React.createContext<boolean>(null);

type AppearanceType = 'default' | 'inverse' | 'subtle';

export interface NavbarProps extends WithAsProps {
  appearance?: AppearanceType;
  classPrefix?: string;
}

interface NavbarComponent extends RsRefForwardingComponent<'div', NavbarProps> {
  /**
   * @deprecated use Navbar.Brand instead
   */
  Header: typeof NavbarHeader;
  /**
   * @deprecated use Nav as direct child of Navbar
   */
  Body: typeof NavbarBody;
  Brand: typeof NavbarBrand;
}

const defaultProps: Partial<NavbarProps> = {
  as: 'nav',
  classPrefix: 'navbar',
  appearance: 'default'
};

const Navbar: NavbarComponent = (React.forwardRef(
  (props: NavbarProps, ref: React.Ref<HTMLElement>) => {
    const { className, as: Component, classPrefix, appearance, ...rest } = props;
    const { withClassPrefix, merge } = useClassNames(classPrefix);
    const classes = merge(className, withClassPrefix(appearance));
    return (
      <NavbarContext.Provider value={true}>
        <Component {...rest} ref={ref} className={classes} />
      </NavbarContext.Provider>
    );
  }
) as unknown) as NavbarComponent;

Navbar.Header = NavbarHeader;
Navbar.Body = NavbarBody;
Navbar.Brand = NavbarBrand;

Navbar.displayName = 'Navbar';
Navbar.defaultProps = defaultProps;

export default Navbar;
