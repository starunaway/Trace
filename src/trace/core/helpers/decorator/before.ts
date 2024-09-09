function Before(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (this: any, ...args: any[]) {
    // Here you can access the method's parameters
    const [type, event] = args;
    console.log('Method parameters:', type, event);
    return originalMethod.apply(this, args);
  };
  return descriptor;
}

export default Before;
